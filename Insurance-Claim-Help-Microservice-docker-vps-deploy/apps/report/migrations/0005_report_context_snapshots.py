from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("report", "0004_report_room_detail"),
    ]

    operations = [
        migrations.AddField(
            model_name="report",
            name="property_snapshot",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="report",
            name="user_snapshot",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
