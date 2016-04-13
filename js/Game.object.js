"use strict";
/* 
 * This code remains the intellectual property of Éamonn "Wing" Kearns
 */

/**
 * This is the container for the game, it acts both as a namespace and as an
 * object to allow easy callbacks to things that need string-based callbacks.
 */
var Game = {
	MINIMUM_CELL_SIZE:10,
	MINIMUM_COLUMN_COUNT: 5,
	TICK_DELAY: 500,
	MAZES_PER_SIZE: 2,
	VERSION: '0.0.1a',
	init: function (data)
	{
		this.mazeElement = data.mazeElement;
		this.parties = [];
		this.mazes = [];
		this.mazesAtThisCellCount = 0;
		this.columnSizeIndex = 0;
		this.columnCounts = [];
		this.mazesExplored = 0;
		if (!this.load())
		{
			this.newGame();
		}
		this.calculateMazeCellSizes();
		this.ticking = true;
		this.$prestigeDialog = $('#RFIDSplash').dialog({
			autoOpen: false,
			height: 300,
			width: 350,
			modal: true
		});
		this.$prestigePartySize = $('#prestigePartySize');
		this.$prestigePartyMembers = $('#prestigePartyMembers');
		this.$prestigeMazeLevel = $('#prestigeMazeLevel');
		this.$prestigeEarned = $('#prestigeEarned');
		this.prestige = 0;
	},
	newGame: function ()
	{
		// add a new party and build a new map
		this.addParty();
		this.createNewMaze();
	},
	load: function ()
	{
		var data = localStorage.getItem('saveState');
		if(!data)
		{
			return false;
		}
		
		var json = JSON.parse(atob(data));
		console.log(json);
		return false;
		// haven't written the party saving yet so just add a new party
		this.addParty();
		this.loadMapFromJSON(json.currentMaze);
		
		return true;	
	},
	save: function()
	{
		var json = {
			gameVersion: this.VERSION,
			mazesAtThisCellCount: this.mazesAtThisCellCount - 1,
			columnSizeIndex:this.columnSizeIndex,
			currentMaze:this.maze.toJSON(),
			party:this.party.toJSON(),
			prestige: this.prestige,
		};
		var jsonString = JSON.stringify(json);
		localStorage.setItem('saveState', btoa(jsonString));
	},
	loadMapFromJSON: function(json)
	{
		
	},
	loadMapFromJSONString: function(jsonString)
	{
		return this.loadMapFromJSON(JSON.parse(jsonString));
	},
	addMaze: function (maze)
	{
		this.maze = maze;
		
		return this;
	},
	addParty: function (party)
	{
		this.party = party?party:new Party();
		return this;
	},
	calculateMazeCellSizes: function ()
	{
		var calculating = true,
				// using this only as a typing shortcut
				mazeWidth = this.maze.width,
				//
				cellCount = this.MINIMUM_COLUMN_COUNT;

		while (calculating)
		{
			if (mazeWidth % cellCount === 0)
			{
				this.columnCounts.push(cellCount);
			}
			cellCount++;
			if (mazeWidth / cellCount < this.MINIMUM_CELL_SIZE)
			{
				calculating = false;
			}
		}
		return this;
	},
	createNewMaze: function ()
	{
		if (this.mazesAtThisCellCount >= this.MAZES_PER_SIZE)
		{
			this.mazesAtThisCellCount = 0;
			this.columnSizeIndex++;
			this.party.addMember();
			if (this.columnSizeIndex >= this.columnCounts.length)
			{
				this.columnSizeIndex = this.columnCounts.length - 1;
			}
		}
		this.addMaze(
			new Maze(
				this.mazeElement,
				{
					cols:this.columnCounts[this.columnSizeIndex],
					rows:this.columnCounts[this.columnSizeIndex]
				}
			).draw()
		);
		this.party.chooseNewMaze(this.maze);
		this.maze.populate();
		return this;
	},
	start: function ()
	{
		this.processTicks = true;
		this.tick();
		return this;
	},
	stop: function ()
	{
		this.processTicks = false;
		return this;
	},
	tick: function ()
	{
		$('#mazesExplored').text(this.mazesExplored);
		$('#mazeCells').text(this.maze.getCellCount());
		$('#partyAction').text(this.party.action);
		
		if (!this.processTicks)
		{
			this.party.stop();
			return;
		}
		this.party.start();
		if (!this.party.exploring)
		{
			this.mazesExplored++;
			this.mazesAtThisCellCount ++;
			this.createNewMaze();
		}
		
		var self = this;
		setTimeout(
			function ()
			{
				self.tick();
			},
			this.TICK_DELAY
		);
	},
	randomArrayElement: function (array)
	{
		return array[Math.floor(Math.random() * array.length)];
	},
	randomizeArray: function(array)
	{
		// https://github.com/coolaj86/knuth-shuffle
		 var currentIndex = array.length, temporaryValue, randomIndex;
		
		// While there remain elements to shuffle...
		while (0 !== currentIndex)
		{
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	},
	combatFeedback:function(toShow, cssClass)
	{
		cssClass = cssClass?cssClass:'';
		cssClass += ' combat';
		this.feedback(toShow);
	},
	feedback:function(toShow, cssClass)
	{
		var html = '';
		
		// no point in repeating, so check if we would be repeating and, if so,
		// skip this outright
		if(toShow === this.lastFeedbackThing)
		{
			return;
		}
		this.lastFeedbackThing = toShow;
		
		if(typeof toShow === "string")
		{
			toShow = [toShow];
		}
		for(var i in toShow)
		{
			html += '<div>'+toShow[i]+'</div>';
		}
		var node = $('<div class="'+cssClass+'">'+html+'</div>');
		var combatFeedbackNode = $('#combat');
		combatFeedbackNode.append(node).scrollTop(combatFeedbackNode.prop("scrollHeight"));
	},
	RFED:function()
	{
		// party has been completely knocked out (Rocks Fall Everyone Die(s/d))
		this.stop();
		var $heroesUl = $('<ul/>');
		var prestige = this.mazesExplored * 5;
		for(var i in this.party.members)
		{
			var member = this.party.members[i];
			$heroesUl.append(
				$('<li/>').append(
					$('<span>').text(
						member.name+
						' LVL '+member.level+
						' '+member.class
					)
				)
			);
			prestige += member.level;
		}
		
		$heroesUl.appendTo(this.$prestigePartyMembers);
		this.$prestigePartySize.text(this.party.members.length);
		this.$prestigeMazeLevel.text(this.mazesExplored);
		this.$prestigeEarned.text(prestige);
		this.$prestigeDialog.dialog("open");
	},
};
