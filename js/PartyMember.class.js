/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var Game = Game?Game:{};

(
function()
{
	var names = {
		male:[
			"Aaron", "Adam", "Adrian", "Aiden", "Alan", "Albert", "Andrew", "Barry","Benjamin", "Bernard", "Bill", "Blake",
			"Bobby", "Bradley", "Brendan", "Brian", "Bruce", "Carl", "Charles", "Chris", "Cole", "Connor", "Corey", "Craig",
			"Daniel", "David", "Dean", "Dennis", "Derek", "Devin", "Dominic", "Donald", "Douglas", "Dustin", "Dylan", "Earl",
			"Earnest", "Edgar", "Edward", "Edwin", "Eoghan", "Epdez", "Erich", "Ethan", "Eugene", "Evan", "Ewan", "Floyd", "Frank",
			"Fred", "Gabriel", "Garreth", "Gary", "Gavin", "George", "Gerald", "Gilbert", "Glen", "Gordon", "Gregory", "Harold",
			"Harry", "Henry", "Herman", "Howard", "Hunter", "Ian", "Isaac", "Ivan", "Jack", "Jacob", "James", "Jason", "Jeff",
			"Jeffrey", "Jeremy", "Jerry", "Jim", "Joe", "Joel", "John", "Jonathan", "Joseph", "Joshua", "Justin", "Keith",
			"Kenneth", "Kevin", "Kyle", "Landon", "Larry", "Lee", "Leonard", "Louis", "Luke", "Marcus", "Mark", "Martin",
			"Matthew", "Max", "Michael", "Mike", "Mitchell", "Nathan",  "Nicholas", "Norman", "Oscar", "Patrick", "Paul",
			"Peter", "Philip", "Phillip", "Ralph", "Randall", "Randy", "Raymond", "Richard", "Robert", "Rodney", "Roger",
			"Ronald", "Roy", "Russell", "Ryan", "Sam", "Samuel", "Scott", "Sean", "Seth", "Shane", "Shawn", "Stanley",
			"Stephen", "Terrance", "Theodore", "Thomas", "Timothy", "Travis", "Trevor", "Troy", "Tyler", "Vernon", "Victor",
			"Vincent", "Walter", "Warren", "Wayne", "Wesley", "William", "Zachary"
		]
	};
	
	function PartyMember(data)
	{
		data = data?data:{};
		this.name = data.name?data.name:Game.randomArrayElement(names.male);
		this.class = data.class?data.class:'Mook';
		
		this.baseXPModifier = data.baseXPModifier ? data.baseXPModifier : 1;
		this.baseXPModifierPerLevel = data.baseXPModifier ? data.baseXPModifier : 1;
		this.dpsIncreases = data.dpsIncreases ? data.dpsIncreases : {};

		this.attributes = {
			'hp': new PartyMemberAttribute(100),
			'dps': new PartyMemberAttribute(10)
		};

		if (this.baseXPModifierPerLevel * this.baseXPModifier > 1)
		{
			throw new {'message': ''};
		}
		this.xpModifier = this.baseXPModifier;
		this.xp = data.xp ? data.xp : 0;
		this.xpToLevel = 10;
		this.levelStep = 10;
		this.level = 1;
		this.calculateLevel();
		return this;
	}


	PartyMember.prototype.calculateLevel = function ()
	{
		while (this.xp >= this.xpToLevel)
		{
			this.levelUp();
		}
		return this.level;
	};

	PartyMember.prototype.getLevel = function ()
	{
		return this.level;
	};

	PartyMember.prototype.levelUp = function ()
	{
		for (var i in this.attributes)
		{
			this.attributes[i].increase();
		}
		this.xpModifier *= this.baseXPModifierPerLevel;
		this.level++;
		this.xpToLevel += this.level * this.levelStep;
		this.updateElement();
	};

	PartyMember.prototype.addXP = function (amount)
	{
		this.xp += amount * this.xpModifier;
		this.calculateLevel();
		return this;
	};

	PartyMember.prototype.getElement = function()
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
				$('<span/>').text('Class: ')
			).append(
				$('<span/>').text(this.class).addClass('memberClass')
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
	
	PartyMember.prototype.updateElement = function()
	{
		$('.memberClass', this.element).text(this.class);
		$('.memberLevel', this.element).text(this.level);
	};
	
	PartyMember.prototype.toJSON = function()
	{
		var data = {
			name:this.name, class:this.class,
			baseXPModifier:this.baseXPModifier, baseXPModifierPerLevel: this.baseXPModifierPerLevel,
			xp:this.xp, xpToLevel:this.xpToLevel, levelStep:this.levelStep, level:this.level,
			attributes:[]
		};
		for(var i in this.attributes)
		{
			data[i] = this.attributes[i].toJSON();
		}
	};
	
	window.PartyMember = PartyMember;
})();