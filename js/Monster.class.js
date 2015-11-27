/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var Game = Game?Game:{};
(function(){
	var names = {
		monster:["Tram", "Imp", "Goblin", "Zombie", "Vampire", "Werewolf", "Ghoul"],
		boss:["Bad Juju", "Scarecrow", "Zapud"],
		prefix:["Dark", "Angry", "Enraged", "Supreme"],
		suffix:["Lord", "King", "Prince"]
	};
	
	function MonsterFactory(data)
	{
		data = data?data:{};
		this.init(data);
	}
	
	MonsterFactory.prototype.init = function(data)
	{
		this.monsterName = data.name?data.name:Game.randomArrayElement(names.monster);
		this.monsterLevel = data.level?data.level:Game.mazesExplored+1;
	};
	
	MonsterFactory.prototype.getSingleMonster = function()
	{
		return new Monster({
			name:this.monsterName,
			level:this.monsterLevel
		});
	};
	
	MonsterFactory.prototype.getSingleEliteMonster = function()
	{
		return new Monster({
			name:Game.randomArrayElement(names.prefix)+' '+this.monsterName,
			level:this.monsterLevel,
			eliteness:1
		});
	};
	
	MonsterFactory.prototype.getSingleEpicMonster = function()
	{
		return new Monster({
			name:Game.randomArrayElement(names.prefix)+' '+this.monsterName+' '+Game.randomArrayElement(names.suffix),
			level:this.monsterLevel,
			eliteness:1
		});
	};
	
	MonsterFactory.prototype.getNewMonsterGroupForParty = function(party)
	{
		var monsterGroup = new AttackerGroup();
		monsterGroup.setToken('monsters');
		
		var size = party.members.length;
		
		
		for(var i = 0; i < size; i++)
		{
			monsterGroup.addMember(this.getSingleMonster());
		};
		
		return monsterGroup;
	};
	
	function Monster(data)
	{
		data = data?data:{};
		this.eliteness = data.eliteness?data.eliteness:0;
		this.name = data.name?data.name:this.buildRandomName();
		this.attributes = {
			'hp': new PartyMemberAttribute(60 + 20 * this.eliteness, 0.06 + 0.2 * this.eliteness),
			'dps': new PartyMemberAttribute(6 + 2 * this.eliteness, 0.06 + 0.2 * this.eliteness)
		};
		var level = data.level?data.level:Game.mazesExplored+1;
		for(var i = 1; i < level; i++)
		{
			this.levelUp();
		}
	}
	
	Monster.prototype = new Attacker();
	Monster.prototype.constructor = Monster;
	
	Monster.prototype.buildRandomName = function()
	{
		var name = '';
		if(this.eliteness > 0)
		{
			name += Game.randomArrayElement(names.prefix)+' ';
		}
		name += Game.randomArrayElement(names.monster);
		if(this.eliteness > 1)
		{
			name += Game.randomArrayElement(names.suffix);
		}
		return name;
	};
	
	Monster.prototype.levelUp = function ()
	{
		this.levelAttributes();
		this.level++;
	};
	
	Monster.prototype.getXPReward = function()
	{
		var xpAward = this.level * 10;
		xpAward += Math.floor(Math.random() * xpAward);
		return xpAward;
	};
	
	
	window.Monster = Monster;
	window.MonsterFactory = MonsterFactory;
})();