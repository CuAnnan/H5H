"use strict";
/* 
 * This code remains the intellectual property of Éamonn "Wing" Kearns
 */

var Game = {
	MINIMUM_CELL_SIZE: 10,
	MINIMUM_COLUMN_COUNT: 5,
	TICK_DELAY: 500,
	MAZES_PER_SIZE: 5,
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
		return this;
	},
	newGame: function ()
	{
		// add a new party and build a new map
		this.addParty();
		this.createNewMaze();
	},
	load: function ()
	{
		console.log("Loading game data");
		var data = localStorage.getItem('saveState');
		if(!data)
		{
			console.log("No save data");
			return false;
		}
		return this.parseSavedData(data);
	},
	parseSavedData: function(data)
	{
		var json = JSON.parse(atob(data));
		
		// haven't written the party saving yet so just add a new party
		this.addParty();
		this.loadMapFromJSON(json.currentMaze);
		
		return true;	
	},
	save: function()
	{
		var json = {
			mazesAtThisCellCount: this.mazesAtThisCellCount - 1,
			columnSizeIndex:this.columnSizeIndex,
			currentMaze:this.maze.toJSON()
		};
		var jsonString = JSON.stringify(json);
		localStorage.setItem('saveState', btoa(jsonString));
	},
	loadMapFromJSON: function(json)
	{
		this.addMaze(
			new Maze(
				this.mazeElement,
				json
			).draw()
		);
		this.party.chooseNewMaze(this.maze);
		return this;
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
		if (this.mazesAtThisCellCount++ >= this.MAZES_PER_SIZE)
		{
			this.mazesAtThisCellCount = 0;
			this.columnSizeIndex++;
			if (this.columnSizeIndex >= this.columnCounts.length)
			{
				this.columnSizeIndex = this.columnCounts.length - 1;
			}
		}
		this.mazesAtThisCellCount++;
		this.mazesExplored++;

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
	}
};
