from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("job_details", "0002_jobdetail_total_cost"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobdetail",
            name="report_path",
            field=models.URLField(blank=True, default=""),
        ),
    ]
