from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("kyc", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="kyc",
            name="status",
            field=models.CharField(
                choices=[("pending", "Pending"), ("approved", "Approved")],
                default="pending",
                max_length=20,
            ),
        ),
    ]
