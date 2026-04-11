from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("job_details", "0003_jobdetail_report_path"),
        ("users", "0003_user_contact"),
    ]

    operations = [
        migrations.AlterField(
            model_name="jobdetail",
            name="builder",
            field=models.ForeignKey(
                blank=True,
                db_column="builder_id",
                null=True,
                on_delete=models.CASCADE,
                related_name="job_details",
                to="users.user",
            ),
        ),
    ]
