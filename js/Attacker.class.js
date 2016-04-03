/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function Attacker()
{
}

Attacker.prototype.takeDamage = function(amount)
{
	this.attributes.hp.applyDamage(amount);
	this.updateElement();
};

Attacker.prototype.updateElement = function()
{	
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