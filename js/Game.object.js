"use strict";
/* 
 * This code remains the intellectual property of Éamonn "Wing" Kearns
 */

var Game = {
	MINIMUM_CELL_SIZE:10,
	MINIMUM_CELL_COUNT:10,
	init:function(data)
	{
		this.mazeElement = data.mazeElement;
		this.parties = [];
		this.mazes = [];
		this.columnCounts = [];
		if(!this.load())
		{
			this.newGame();
		}
		this.calculateMazeCellSizes();
		this.ticking = true;
		this.tick();
		return this;
	},
	newGame:function()
	{
		this.addMaze(new Maze(this.mazeElement, this.MINIMUM_CELL_COUNT, this.MINIMUM_CELL_COUNT).draw());
		this.addParty(new Party().chooseNewMaze(this.maze));	
	},
	load:function()
	{
		// this is just a place holder for until I have local storage implemented
		return false;
	},
	addMaze:function(maze)
	{
		this.mazes.push(maze);
		this.maze = maze;
		return this;
	},
	addParty:function(party)
	{
		this.party = party;
		this.parties.push(party);
		return this;
	},
	calculateMazeCellSizes:function()
	{
		var	calculating = true, 
			// using this only as a typing shortcut
			mazeWidth = this.maze.width,
			//
			cellCount = this.MINIMUM_CELL_COUNT;
			
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
	tick:function()
	{
		for(var i in this.parties)
		{
			if(this.parties[i].exploring)
			{
				this.parties[i].processTick();
			}
		}
		var self = this;
		setTimeout(
			function()
			{
				self.tick()
			},
			250
		);
	},
	randomArrayElement:function(array)
	{
		return array[Math.floor(Math.random() * array.length)];
	}
};