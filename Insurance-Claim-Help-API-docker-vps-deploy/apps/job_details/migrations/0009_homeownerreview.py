from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("job_details", "0008_jobdetail_room_id_jobdetail_property_id"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="HomeownerReview",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("comment", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "job_detail",
                    models.ForeignKey(
                        db_column="job_detail_id",
                        on_delete=models.deletion.CASCADE,
                        related_name="homeowner_reviews",
                        to="job_details.jobdetail",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        db_column="user_id",
                        on_delete=models.deletion.CASCADE,
                        related_name="homeowner_reviews",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "homeowner_reviews",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddConstraint(
            model_name="homeownerreview",
            constraint=models.UniqueConstraint(
                fields=("job_detail", "user"),
                name="unique_homeowner_review_per_job_detail_user",
            ),
        ),
    ]
