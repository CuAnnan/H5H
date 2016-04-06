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
	/**
	 * A text field used to help in feedback
	 */
	this.token = '';
}

AttackerGroup.prototype.setToken = function(token)
{
	this.token = token;
};

AttackerGroup.prototype.addMember = function(member)
{
	this.members.push(member);
	this.updateNode();
	return this;
};

AttackerGroup.prototype.isFirstAttacker = function()
{
	return this.firstAttacker;
};

AttackerGroup.prototype.updateNode = function()
{
	var node = $(this.nodeId).empty();
	for(var i in this.members)
	{
		var i = parseInt(i);
		var member = this.members[i];
		console.log("Adding node for member "+(i+1))
		node.append(member.getElement());
	}
};

AttackerGroup.prototype.takeDamage = function(totalAmount)
{
	var memberAmount = Math.ceil(totalAmount/this.members.length);
	this.hpLeft = 0;
	this.totalHp = 0;
	this.alive = false
	for(var i in this.members)
	{
		var member = this.members[i];
		member.takeDamage(memberAmount);
		if(member.isAlive())
		{
			this.hpLeft += member.getRemainingHP();
			this.totalHp += member.attributes.hp.getValue();
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
	this.roundText = 'The '+this.token+' do '+parseInt(this.roundDPS)+' damage to the '+target.token;
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