/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function Combat(party, monsters)
{
	this.party = party;
	party.token = 'party';
	this.monsters = monsters;
	monsters.token = 'monsters';
	this.ongoing = true;
	this.rounds = 0;
	this.party.updateNode();
	this.monsters.updateNode();
	
	// determine order by defaulting to party as first striker
	// and only swapping the order if the monsters have explicit first strike
	if(this.monsters.isFirstAttacker())
	{
		this.firstStriker = this.monsters;
		this.secondStriker = this.party;
	}
	else
	{
		this.firstStriker = this.party;
		this.secondStriker = this.monsters;
	}
	$('#monstersLi').css('display', 'list-item');
	
}

Combat.prototype.isOngoing = function()
{
	return this.ongoing;
};

Combat.prototype.isFinished = function()
{
	return !this.isOngoing();
};

Combat.prototype.tick = function()
{
	// run attacks
	this.firstStriker.attack(this.secondStriker);
	if(this.secondStriker.isAlive())
	{
		this.secondStriker.attack(this.firstStriker);
		this.ongoing = this.firstStriker.isAlive();
	}
	else
	{
		this.secondStriker.roundText = 'The '+this.secondStriker.token+' died';
		this.ongoing = false;
	}
	
	Game.combatFeedback(
		[this.firstStriker.roundText,this.secondStriker.roundText]
	);
	
	if(!this.ongoing)
	{
		this.endCombat();
	}
	
	return this;
};


Combat.prototype.endCombat = function()
{
	Game.combatFeedback("The combat ended in "+this.rounds+" rounds", 'combatFeedback');
	if(this.party.isAlive())
	{
		$('#monstersLi').css('display', 'none');
		this.party.addXP(this.monsters.getXPReward());
	}
	else
	{
		Game.RFED();
	}
	Game.save();
}