"use strict";
/* 
 * This code remains the intellectual property of Éamonn "Wing" Kearns
 */

var Game = {
	MINIMUM_CELL_SIZE:10,
	MINIMUM_COLUMN_COUNT:20,
	TICK_DELAY:250,
	MAZES_PER_SIZE:2,
	init:function(data)
	{
		this.mazeElement = data.mazeElement;
		this.parties = [];
		this.mazes = [];
		this.mazesAtThisCellCount = 0;
		this.columnSizeIndex = 0;
		this.columnCounts = [];
		this.mazesExplored = 0;
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
		this.addMaze(new Maze(this.mazeElement, this.MINIMUM_COLUMN_COUNT, this.MINIMUM_COLUMN_COUNT).draw());
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
		
		this.addMaze(new Maze(
				this.mazeElement,
				this.columnCounts[this.columnSizeIndex],
				this.columnCounts[this.columnSizeIndex]
		).draw());
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
		
		if(!this.processTicks)
		{
			return;
		}
		if(this.party.exploring)
		{
			this.party.processTick();
		}
		else
		{
			this.createNewMaze();
		}
		var self = this;
		setTimeout(
			function()
			{
				self.tick()
			},
			this.TICK_DELAY
		);
	},
	randomArrayElement:function(array)
	{
		return array[Math.floor(Math.random() * array.length)];
	}
};