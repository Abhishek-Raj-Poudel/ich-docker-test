# Insurance_Claim/celery.py
import os
import platform
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Insurance_Claim.settings")

app = Celery("Insurance_Claim")
app.config_from_object("django.conf:settings", namespace="CELERY")

# Celery's prefork pool is not safe with PyTorch/MPS-backed workloads on macOS.
# Use a single-process worker there to avoid fork-related crashes.
if platform.system() == "Darwin":
    app.conf.worker_pool = "solo"
    app.conf.worker_concurrency = 1

app.autodiscover_tasks()
