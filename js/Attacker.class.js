/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function Attacker()
{
	this.attributes = {
		'hp': new PartyMemberAttribute(100),
		'dps': new PartyMemberAttribute(10)
	};
	this.level = 1;
}

Attacker.prototype.takeDamage = function(amount)
{
	this.attributes.hp.applyDamage(amount);
};

Attacker.prototype.getDPS = function()
{
	return this.attributes.dps.getValue();
};

Attacker.prototype.getRemainingHP = function()
{
	return this.attributes.hp.getRemaining();
};

Attacker.prototype.isAlive = function()
{
	return parseInt(this.attributes.hp.getRemaining()) > 0;
};

Attacker.prototype.levelAttributes = function()
{
	for (var i in this.attributes)
	{
		this.attributes[i].increase();
	}
};

Attacker.prototype.getLevel = function ()
{
	return this.level;
};

Attacker.prototype.renew = function()
{
	this.attributes.hp.renew();
};