from django.core.management.base import BaseCommand

from apps.materials.models import Materials


MATERIALS = [
    "Drywall",
    "Plywood",
    "Hardwood Flooring",
    "Laminate Flooring",
    "Vinyl Flooring",
    "Ceramic Tile",
    "Porcelain Tile",
    "Marble Tile",
    "Granite Slab",
    "Quartz Countertop",
    "Concrete",
    "Brick",
    "Cinder Block",
    "Stucco",
    "Plaster",
    "Insulation Batts",
    "Spray Foam Insulation",
    "Fiberglass Insulation",
    "Acoustic Ceiling Tile",
    "Drop Ceiling Grid",
    "Roof Shingles",
    "Metal Roofing",
    "Roof Underlayment",
    "Flashing",
    "Gutter",
    "Downspout",
    "PVC Pipe",
    "Copper Pipe",
    "PEX Pipe",
    "CPVC Pipe",
    "Pipe Insulation",
    "Electrical Wire",
    "Conduit",
    "Junction Box",
    "Circuit Breaker",
    "Light Fixture",
    "Recessed Light",
    "LED Bulb",
    "Ceiling Fan",
    "Exhaust Fan",
    "HVAC Duct",
    "Air Vent",
    "Thermostat",
    "Furnace Filter",
    "Window Glass",
    "Tempered Glass",
    "Mirror Panel",
    "Aluminum Window Frame",
    "Wood Window Frame",
    "Door Slab",
    "Door Frame",
    "Door Hinge",
    "Door Knob",
    "Deadbolt Lock",
    "Baseboard",
    "Crown Molding",
    "Trim Board",
    "Caulk",
    "Sealant",
    "Wood Filler",
    "Primer",
    "Interior Paint",
    "Exterior Paint",
    "Epoxy Coating",
    "Waterproof Membrane",
    "Adhesive",
    "Thinset Mortar",
    "Grout",
    "Silicone Sealant",
    "Wallpaper",
    "Wall Panel",
    "MDF Board",
    "Particle Board",
    "OSB Board",
    "Steel Stud",
    "Wood Stud",
    "Anchor Bolt",
    "Lag Screw",
    "Drywall Screw",
    "Nail",
    "Washer",
    "Nut and Bolt Set",
    "Rebar",
    "Mesh Wire",
    "Cabinet Panel",
    "Cabinet Hinge",
    "Countertop Edge Trim",
    "Sink Basin",
    "Faucet",
    "Shower Valve",
    "Bathtub",
    "Toilet Bowl",
    "Vanity Top",
    "Backsplash Tile",
    "Weather Stripping",
    "Expansion Foam",
    "Subfloor Panel",
    "Underlayment Board",
    "Carpet Tile",
    "Rubber Flooring",
    "Stone Veneer",
]


class Command(BaseCommand):
    help = "Seed the materials table with common construction materials."

    def handle(self, *args, **options):
        created_count = 0

        for material_name in MATERIALS:
            _, created = Materials.objects.get_or_create(material=material_name)
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded materials table. Added {created_count} new rows out of {len(MATERIALS)} materials."
            )
        )
