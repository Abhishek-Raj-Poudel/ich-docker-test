import glob
import os
import shutil
import subprocess
from pathlib import Path

import trimesh
from celery import shared_task
from django.contrib.contenttypes.models import ContentType
from django.conf import settings
from apps.room_details.models import RoomDetail
from apps.media_library.models import MediaLibrary

MIN_IMAGES_REQUIRED = 10
VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi"}
FRAME_EXTRACTION_FPS = 2
COLMAP_MODEL_RELATIVE_PATH = Path("colmap") / "sparse" / "0"


def _is_video(path: str) -> bool:
    return os.path.splitext(path)[1].lower() in VIDEO_EXTENSIONS


def _extract_frames(
    video_path: str, output_dir: str, fps: int = FRAME_EXTRACTION_FPS
) -> list[str]:
    """
    Extract frames from a video using ffmpeg.
    Returns list of extracted frame file paths.
    """
    os.makedirs(output_dir, exist_ok=True)
    output_pattern = os.path.join(output_dir, "frame_%04d.jpg")

    subprocess.run(
        [
            "ffmpeg",
            "-i",
            video_path,
            "-vf",
            f"fps={fps}",
            "-q:v",
            "2",
            output_pattern,
            "-y",
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    return sorted(glob.glob(os.path.join(output_dir, "frame_*.jpg")))


def _reset_directory(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path, ignore_errors=True)
    path.mkdir(parents=True, exist_ok=True)


def _load_torch():
    import torch

    return torch


def _torch_device_type() -> str:
    torch = _load_torch()
    if torch.cuda.is_available():
        return "cuda"
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def _colmap_use_gpu() -> bool:
    return _torch_device_type() == "cuda"


@shared_task
def run_nerf_pipeline(room_id):
    room = RoomDetail.objects.get(id=room_id)
    room.processing_status = "processing"
    room.save()

    try:
        torch_device_type = _torch_device_type()
        base_rel_path = Path("media") / "rooms" / f"room_{room_id}"
        base_path = Path(settings.BASE_DIR) / base_rel_path
        image_dir = base_path / "images"
        nerf_dir = base_path / "nerf"
        colmap_dir = nerf_dir / "colmap"
        colmap_db = colmap_dir / "database.db"
        sparse_dir = colmap_dir / "sparse"
        sparse_model_dir = nerf_dir / COLMAP_MODEL_RELATIVE_PATH
        frames_dir = base_path / "frames"

        _reset_directory(image_dir)
        _reset_directory(nerf_dir)
        _reset_directory(frames_dir)
        colmap_dir.mkdir(parents=True, exist_ok=True)
        sparse_dir.mkdir(parents=True, exist_ok=True)

        ct = ContentType.objects.get_for_model(RoomDetail)
        media_files = list(
            MediaLibrary.objects.filter(mediable_type=ct, mediable_id=room_id)
        )

        image_paths: list[str] = []

        for media in media_files:
            src = media.file.path

            if _is_video(src):
                video_frames_dir = frames_dir / f"media_{media.pk}"
                extracted = _extract_frames(
                    src, str(video_frames_dir), fps=FRAME_EXTRACTION_FPS
                )
                if not extracted:
                    raise RuntimeError(f"ffmpeg extracted 0 frames from video: {src}")
                image_paths.extend(extracted)
            else:
                image_paths.append(src)

        if len(image_paths) < MIN_IMAGES_REQUIRED:
            raise ValueError(
                f"At least {MIN_IMAGES_REQUIRED} images are required for 3D "
                f"reconstruction, got {len(image_paths)}. "
                f"Upload more images or a longer video."
            )

        for src in image_paths:
            filename = os.path.basename(src)
            dst = image_dir / filename
            if dst.exists():
                name, ext = os.path.splitext(filename)
                dst = image_dir / f"{name}_{os.urandom(4).hex()}{ext}"
            shutil.copy2(src, dst)

        subprocess.run(
            [
                "colmap",
                "feature_extractor",
                "--database_path",
                str(colmap_db),
                "--image_path",
                str(image_dir),
                "--ImageReader.single_camera",
                "1",
                "--ImageReader.camera_model",
                "OPENCV",
                "--FeatureExtraction.use_gpu",
                "1" if _colmap_use_gpu() else "0",
            ],
            check=True,
        )

        subprocess.run(
            [
                "colmap",
                "exhaustive_matcher",
                "--database_path",
                str(colmap_db),
                "--TwoViewGeometry.min_num_inliers",
                "15",
                "--FeatureMatching.use_gpu",
                "1" if _colmap_use_gpu() else "0",
            ],
            check=True,
        )

        subprocess.run(
            [
                "colmap",
                "mapper",
                "--database_path",
                str(colmap_db),
                "--image_path",
                str(image_dir),
                "--output_path",
                str(sparse_dir),
            ],
            check=True,
        )

        if not sparse_model_dir.is_dir() or not any(sparse_model_dir.iterdir()):
            raise FileNotFoundError(
                f"COLMAP mapper produced no sparse model at {sparse_model_dir}. "
                f"Check image quality and overlap."
            )

        process_command = [
            "ns-process-data",
            "images",
            "--data",
            str(image_dir),
            "--output-dir",
            str(nerf_dir),
            "--skip-colmap",
            "--colmap-model-path",
            str(COLMAP_MODEL_RELATIVE_PATH),
        ]
        if torch_device_type == "cuda":
            process_command.append("--gpu")
        else:
            process_command.append("--no-gpu")
        subprocess.run(process_command, check=True)

        transforms_path = nerf_dir / "transforms.json"
        if not transforms_path.is_file():
            raise FileNotFoundError(
                f"ns-process-data did not produce {transforms_path}."
            )

        train_command = [
            "ns-train",
            "nerfacto",
            "--data",
            str(nerf_dir),
            "--output-dir",
            str(nerf_dir),
        ]
        if torch_device_type != "cpu":
            train_command.extend(["--machine.device-type", torch_device_type])
            if torch_device_type == "mps":
                train_command.extend(["--pipeline.model.implementation", "torch"])
        else:
            train_command.extend(
                [
                    "--machine.device-type",
                    "cpu",
                    "--pipeline.model.implementation",
                    "torch",
                ]
            )

        subprocess.run(train_command, check=True)

        configs = glob.glob(f"{nerf_dir}/**/config.yml", recursive=True)
        if not configs:
            raise FileNotFoundError(
                f"ns-train did not produce a config.yml under {nerf_dir}"
            )
        config_path = sorted(configs)[-1]

        mesh_path = nerf_dir / "mesh.ply"
        subprocess.run(
            [
                "ns-export",
                "mesh",
                "--load-config",
                config_path,
                "--output-path",
                str(mesh_path),
            ],
            check=True,
        )

        mesh = trimesh.load(str(mesh_path))
        min_bound, max_bound = mesh.bounds
        room.length = float(max_bound[0] - min_bound[0])
        room.width = float(max_bound[1] - min_bound[1])
        room.height = float(max_bound[2] - min_bound[2])
        room.mesh_path = str(base_rel_path / "nerf" / "mesh.ply")
        room.nerf_output_path = str(base_rel_path / "nerf")
        room.processing_status = "done"
        room.save()

        if frames_dir.exists():
            shutil.rmtree(frames_dir, ignore_errors=True)

    except ValueError as e:
        room.processing_status = "failed"
        room.save()
        raise

    except FileNotFoundError as e:
        room.processing_status = "failed"
        room.save()
        raise

    except subprocess.CalledProcessError as e:
        room.processing_status = "failed"
        room.save()
        raise

    except Exception as e:
        room.processing_status = "failed"
        room.save()
        raise
