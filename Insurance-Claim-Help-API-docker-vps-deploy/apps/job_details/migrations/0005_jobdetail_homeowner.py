from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("job_details", "0004_alter_jobdetail_builder"),
        ("users", "0003_user_contact"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobdetail",
            name="homeowner",
            field=models.ForeignKey(
                blank=True,
                db_column="homeowner_id",
                null=True,
                on_delete=models.CASCADE,
                related_name="posted_job_details",
                to="users.user",
            ),
        ),
    ]
