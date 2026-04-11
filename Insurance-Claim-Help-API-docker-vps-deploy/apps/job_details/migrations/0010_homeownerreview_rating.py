from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("job_details", "0009_homeownerreview"),
    ]

    operations = [
        migrations.AddField(
            model_name="homeownerreview",
            name="rating",
            field=models.PositiveSmallIntegerField(
                default=5,
                validators=[MinValueValidator(1), MaxValueValidator(5)],
            ),
            preserve_default=False,
        ),
    ]
