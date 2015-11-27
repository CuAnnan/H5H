/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function AttackerGroup()
{
	this.members = [];
	this.alive = true;
	this.firstAttacker = false;
	this.token = '';
}

AttackerGroup.prototype.setToken = function(token)
{
	this.token = token;
};

AttackerGroup.prototype.addMember = function(member)
{
	this.members.push(member);
	return this;
};

AttackerGroup.prototype.isFirstAttacker = function()
{
	return this.firstAttacker;
};

AttackerGroup.prototype.takeDamage = function(totalAmount)
{
	var memberAmount = Math.ceil(totalAmount/this.members.length);
	this.hpLeft = 0;
	this.alive = false;
	for(var i in this.members)
	{
		this.members[i].takeDamage(memberAmount);
		if(this.members[i].isAlive())
		{
			this.hpLeft += this.members[i].getRemainingHP();
			this.alive = true;
		}
	};
	return this;
};

AttackerGroup.prototype.calculateDPS = function()
{
	var dps = 0;
	for(var i in this.members)
	{
		if(this.members[i].isAlive())
		{
			dps += this.members[i].getDPS();
		}
	}
	this.roundDPS = dps;
	return dps;
};

AttackerGroup.prototype.isAlive = function()
{
	return this.alive;
};

AttackerGroup.prototype.attack = function(target)
{
	target.takeDamage(this.calculateDPS());
	this.roundText = 'The '+this.token+' do '+parseInt(this.roundDPS)+' damage to '+target.token+'('+parseInt(target.hpLeft)+'hp)';
	return this;
};

AttackerGroup.prototype.getXPReward = function()
{
	var xpReward = 0;
	for(var i in this.members)
	{
		xpReward += this.members[i].getXPReward();
	}
	return xpReward;
};

AttackerGroup.prototype.renew = function()
{
	for(var i in this.members)
	{
		this.members[i].renew();
	}
};