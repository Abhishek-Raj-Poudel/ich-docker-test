from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_user_email_verification_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="contact",
            field=models.CharField(default="", max_length=50),
        ),
    ]
