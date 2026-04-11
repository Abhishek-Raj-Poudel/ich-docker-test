from django.db import migrations


def rename_reviewed_to_accepted(apps, schema_editor):
    JobDetail = apps.get_model("job_details", "JobDetail")
    JobDetail.objects.filter(status="reviewed").update(status="accepted")


def rename_accepted_to_reviewed(apps, schema_editor):
    JobDetail = apps.get_model("job_details", "JobDetail")
    JobDetail.objects.filter(status="accepted").update(status="reviewed")


class Migration(migrations.Migration):

    dependencies = [
        ("job_details", "0005_jobdetail_homeowner"),
    ]

    operations = [
        migrations.RunPython(
            rename_reviewed_to_accepted,
            reverse_code=rename_accepted_to_reviewed,
        ),
    ]
