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
}

Combat.prototype.isOngoing = function()
{
	return this.ongoing;
};

Combat.prototype.isFinished = function()
{
	return !this.ongoing;
}

Combat.prototype.tick = function()
{
	// determine order by defaulting to party as first striker
	// and only swapping the order if the monsters have explicit first strike
	var firstStriker = this.party;
	var secondStriker = this.monsters;
	this.rounds++;
	
	if(this.monsters.isFirstAttacker())
	{
		firstStriker = this.monsters;
		secondStriker = this.party;
	}
	
	// run attacks
	firstStriker.attack(secondStriker);
	if(secondStriker.isAlive())
	{
		secondStriker.attack(firstStriker);
		this.ongoing = firstStriker.isAlive();
	}
	else
	{
		secondStriker.roundText = 'The '+secondStriker.token+' died';
		this.ongoing = false;
	}
	
	Game.combatFeedback(
		[firstStriker.roundText,secondStriker.roundText]
	);
	
	if(!this.ongoing)
	{
		Game.combatFeedback("The combat ended in "+this.rounds+" rounds", 'combatFeedback');
		if(this.party.isAlive())
		{
			this.party.addXP(this.monsters.getXPReward());
		};
	}
	
	return this;
};
