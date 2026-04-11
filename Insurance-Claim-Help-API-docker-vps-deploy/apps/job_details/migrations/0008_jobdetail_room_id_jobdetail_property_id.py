from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("job_details", "0007_alter_jobdetail_status"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobdetail",
            name="property_id",
            field=models.PositiveBigIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="jobdetail",
            name="room_id",
            field=models.PositiveBigIntegerField(blank=True, null=True),
        ),
    ]
