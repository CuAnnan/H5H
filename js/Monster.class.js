/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var Game = Game?Game:{};
(function(){
	var names = {
		monster:[
			"Tram", "Imp", "Goblin", "Zombie", "Vampire", "Werewolf", "Ghoul",
			"Djin", "Fairy", "Elf", "Pixie", "Spirit", "Ghost", "Sprite"
		],
		boss:["Bad Juju", "Scarecrow", "Zapud", "Kaoleth", "Wazaq"],
		prefix:["Dark", "Angry", "Enraged", "Supreme", "Grand"],
		suffix:["Lord", "King", "Prince", "Knight", "Queen"]
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
		monsterGroup.nodeId = '#monsters';
		
		var size = party.members.length;
		
		
		for(var i = 0; i < size; i++)
		{
			monsterGroup.addMember(this.getSingleMonster());
		};
		monsterGroup.updateNode();
		return monsterGroup;
	};
	
	function Monster(data)
	{
		data = data?data:{};
		this.eliteness = data.eliteness?data.eliteness:0;
		this.name = data.name?data.name:this.buildRandomName();
		this.attributes = {
			'hp': new PartyMemberAttribute(60 + 20 * this.eliteness, 0.2 + 0.2 * this.eliteness),
			'dps': new PartyMemberAttribute(6 + 2 * this.eliteness, 0.6 + 0.2 * this.eliteness)
		};
		var level = data.level?data.level:Game.mazesExplored+1;
		this.level = 1;
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
		var xpAward = this.level * 5;
		xpAward += Math.floor(xpAward + Math.random() * xpAward / 2);
		return xpAward;
	};
	
	Monster.prototype.getElement = function()
	{
		if(this.element)
		{
			return this.element;
		}
		this.element = $('<li/>');
		// build up the complex list element and use classes within this.element and $ to access them
		$('<ul/>').append(
			$('<li/>').text('Name: '+this.name)
		).append(
			$('<li/>').append(
				$('<span/>').text('HP: ')
			).append(
				$('<span/>')
					.text(this.attributes.hp.getRemaining())
					.addClass('hpRemainingNode')
					.addClass('partyMemberAttribute')
			).append(
				$('<span/>').text('/')
			).append(
				$('<span/>')
					.text(this.attributes.hp.getValue())
					.addClass('hpTotalNode')
					.addClass('partyMemberAttribute')
			)
		).append(
			$('<li/>').append(
				$('<span/>').text('Level: ')
			).append(
				$('<span/>').text(this.level).addClass('memberLevel')
			)
		).appendTo(this.element);
		return this.element;
	};
	
	Monster.prototype.updateElement = function()
	{
		$('.hpRemainingNode', this.element).text(parseInt(this.attributes.hp.getRemaining()));
	};
	
	window.Monster = Monster;
	window.MonsterFactory = MonsterFactory;
})();