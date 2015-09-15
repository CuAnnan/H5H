function PartyMemberAttribute(base, growthFactor)
{
	this.base = base;
	this.growthFactor = growthFactor?growthFactor:0.1;
	this.type = 'base';
	this.current = base;
	this.growthFactors = {'base':this.growthFactor};
	this.increases = [];
}

PartyMemberAttribute.prototype.increase = function(type)
{
	type = type?type:this.type;
	var growthFactor = this.growthFactors[type];
	var increase = this.current * growthFactor;
	this.current += increase;
	this.increases.push({"type":type, "growthFactor":growthFactor, "amount":increase});
	return this;
};

PartyMemberAttribute.prototype.getValue = function()
{
	var value = this.base;
	for(var i in this.values)
	{
		value *= this.values[i].factor;
	}
	return value;
};

PartyMemberAttribute.prototype.setGrowthFactor = function(type, value)
{
	if(this.growthFactors[type])
	{
		return;
	}
	this.growthFactors[type] = value;
	return this;
}