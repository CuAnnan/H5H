function PartyMemberAttribute(base, growthFactor)
{
	this.base = base;
	this.growthFactor = growthFactor?growthFactor:0.1;
	this.type = 'base';
	this.current = base;
	this.growthFactors = {'base':this.growthFactor};
	this.increases = [];
	this.damage = 0;
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

PartyMemberAttribute.prototype.applyDamage = function(amount)
{
	this.damage += amount;
	if(this.current < this.damage)
	{
		this.damage = this.current;
	}
};

PartyMemberAttribute.prototype.getValue = function()
{
	return Math.floor(this.current);
};

PartyMemberAttribute.prototype.getRemaining = function()
{
	return this.current - this.damage;
};

PartyMemberAttribute.prototype.renew = function()
{
	this.damage = 0;
};

PartyMemberAttribute.prototype.setGrowthFactor = function(type, value)
{
	if(this.growthFactors[type])
	{
		return;
	}
	this.growthFactors[type] = value;
	return this;
};

PartyMemberAttribute.prototype.toJSON = function()
{
	return {
		base: this.base, growthFactor: this.growthFactor, type: this.type, damage:this.damage,
		current:this.current, growthFactors:this.growthFactors, increases:this.increases
	};
};