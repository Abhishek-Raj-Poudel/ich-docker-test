import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("contenttypes", "0002_remove_content_type_name"),
    ]

    operations = [
        migrations.CreateModel(
            name="MediaLibrary",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("file", models.FileField(upload_to="media-library/")),
                ("file_type", models.CharField(blank=True, max_length=100)),
                ("file_size", models.PositiveBigIntegerField(default=0)),
                ("mediable_id", models.PositiveBigIntegerField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "mediable_type",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="media_library_items",
                        to="contenttypes.contenttype",
                    ),
                ),
            ],
            options={
                "db_table": "media_library",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="medialibrary",
            index=models.Index(fields=["mediable_type", "mediable_id"], name="media_libra_mediabl_6cfcdb_idx"),
        ),
    ]

