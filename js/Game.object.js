"use strict";
/* 
 * This code remains the intellectual property of Éamonn "Wing" Kearns
 */

var Game = {
	MINIMUM_CELL_SIZE:10,
	MINIMUM_COLUMN_COUNT:5,
	TICK_DELAY:500,
	MAZES_PER_SIZE:5,
	init:function(data)
	{
		this.mazeElement = data.mazeElement;
		this.parties = [];
		this.mazes = [];
		this.mazesAtThisCellCount = 0;
		this.columnSizeIndex = 0;
		this.columnCounts = [];
		this.mazesExplored = 0;
		this.currentSeed = this.getCurrentRandomSeed();
		if(!this.load())
		{
			this.newGame();
		}
		this.calculateMazeCellSizes();
		this.ticking = true;
		return this;
	},
	newGame:function()
	{
		this.addMaze(this.getNewMaze().draw());
		this.addParty(new Party().chooseNewMaze(this.maze));	
	},
	load:function()
	{
		// this is just a place holder for until I have local storage implemented
		return false;
	},
	addMaze:function(maze)
	{
		this.maze = maze;
		return this;
	},
	addParty:function(party)
	{
		this.party = party;
		return this;
	},
	calculateMazeCellSizes:function()
	{
		var	calculating = true, 
			// using this only as a typing shortcut
			mazeWidth = this.maze.width,
			//
			cellCount = this.MINIMUM_COLUMN_COUNT;
			
		while(calculating)
		{
			if(mazeWidth % cellCount === 0)
			{
				this.columnCounts.push(cellCount);
			}
			cellCount++;
			if(mazeWidth / cellCount < this.MINIMUM_CELL_SIZE)
			{
				calculating = false;
			}
		}
	},
	getNewMaze:function(columns, rows)
	{
		columns = columns?columns:this.MINIMUM_COLUMN_COUNT;
		rows = rows? rows: columns;
		return new Maze(this.mazeElement, columns, rows);
	},
	createNewMaze:function()
	{
		if(this.mazesAtThisCellCount++ >= this.MAZES_PER_SIZE)
		{
			this.mazesAtThisCellCount = 0;
			this.columnSizeIndex++;
			if(this.columnSizeIndex >= this.columnCounts.length)
			{
				this.columnSizeIndex = this.columnCounts.length - 1;
			}
		}
		this.mazesAtThisCellCount++;
		this.mazesExplored++;
		this.addMaze(
			this.getNewMaze(this.columnCounts[this.columnSizeIndex])
			.draw()
		);
		this.party.chooseNewMaze(this.maze);
	},
	start:function()
	{
		this.processTicks = true;
		this.tick();
	},
	stop:function()
	{
		this.processTicks = false;
	},
	tick:function()
	{
		$('#mazesExplored').text(this.mazesExplored);
		$('#mazeCells').text(this.maze.getCellCount());
		$('#partyAction').text(this.party.action);
		$('#partyLevel').text(this.party.level);
		$('#partyXp').text(this.party.xp);
		$('#partyXpToLevel').text(this.party.xpToLevel);
		
		if(!this.processTicks)
		{
			this.party.stop();
			return;
		}
		this.party.start();
		if(!this.party.exploring)
		{
			this.createNewMaze();
		}
		var self = this;
		setTimeout(
			function()
			{
				self.tick();
			},
			this.TICK_DELAY
		);
	},
	randomArrayElement:function(array)
	{
		return array[Math.floor(Math.random() * array.length)];
	},
	generateNextSeed:function()
	{
		var seedGenerator = new Math.seedrandom(this.currentSeed);
		var newInt = ""+seedGenerator.int32();
		var newSeed = md5(newInt);
		Math.seedrandom(newSeed);
		this.setCurrentRandomSeed(newSeed);
	},
	setCurrentRandomSeed:function(seed)
	{
		this.currentSeed = seed;
		localStorage.setItem('currentRandomSeed', seed);
	},
	getCurrentRandomSeed:function()
	{
		if(!this.currentSeed)
		{
			console.log('No value for current random seed')
			var lsSeed = localStorage.getItem('currentRandomSeed');
			if(lsSeed)
			{
				console.log('Have stored seed of '+lsSeed);
				this.currentSeed = lsSeed;
			}
			else
			{
				console.log('No stored value for current random seed');
				// this is (ostensibly) our first time doing this
				var randomSeed = Math.seedrandom();
				var usableSeed = md5(randomSeed);
				this.setCurrentRandomSeed(usableSeed);
				return usableSeed;
			}
		}
		Math.seedrandom(this.currentSeed);
		return this.currentSeed;
	}
};