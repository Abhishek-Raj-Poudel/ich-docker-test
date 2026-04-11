from decimal import Decimal

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("job_details", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobdetail",
            name="total_cost",
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal("0.00"),
                max_digits=12,
            ),
        ),
    ]
