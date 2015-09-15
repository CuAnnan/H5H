function Equipment()
{
	this.bonuses = {
		"hp":0,
		"dps":0,
		"block":0
	};
	this.enchantmentTypes = {
		"stalwart":"hp",
		"spiked":"dps",
		"hardy":"health"
	};
	this.hash = null;
}

