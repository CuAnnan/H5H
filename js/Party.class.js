"use strict";
var SVGHelper = SVGHelper ? SVGHelper : {};
var Game = Game ? Game : {};
/* 
 * This code remains the intellectual property of Éamonn "Wing" Kearns
 */
function Party(members)
{
	this.fbClasses = {
		'exploration':'explorationFeedback',
		'combat':'combatFeedback',
	};
	
	// used for the interval
	this.processTicks = false;
	this.tickTime = 1000;
	this.tickTimeExponent = 0.99;

	// xp stuff;
	this.xp = 0;
	this.level = 1;
	this.xpToLevel = 100;
	this.levelStep = 100;

	/**
	 * Party modes.
	 */
	this.modes = {speedRun: 'speedRun', fullExplore: 'fullExplore'};
	this.mode = this.modes.fullExplore;

	/**
	 * The action being taken by the party
	 */
	this.actions = {
		exit: 'Searching for exit',
		fullExplore: 'Exploring maze fully',
		returnToExit: 'Returning to maze exit',
		idle: 'Idling',
		combat: 'In combat'
	};
	this.action = this.actions.exit;


	/**
	 * {Cell} The cell the party is currently exploring.
	 */
	this.currentCell = null;
	/**
	 * {Maze} The maze the party is currently exploring
	 */
	this.maze = null;
	/**
	 * {DomElement} The Dom Element the cell is represented by
	 */
	this.svgElement = null;

	/**
	 * A flag for whether or not the party has finished with the current maze
	 */
	this.exploring = true;
	/**
	 * A flag for whether or not the party has found the end point of the current maze
	 */
	this.endPointFound = false;

	/**
	 * The route the party has taken thus far.
	 */
	this.route = [];
	/**
	 * A reversal of the route the party took from the start to the end point. This is populated
	 * when the party gets to the end point.
	 */
	this.reversedRouteIterator = null;
	/**
	 * The route being taken in exploring.
	 */
	this.exposeRoute;
	
	/**
	 * the HTML node id being used to represent the party
	 * This is inherited from AttackerGroup and defined here
	 */
	this.nodeId = '#party';
	
	if(members)
	{
		for(var i in members)
		{
			this.addMember(members[i]);
		}
	}
	else
	{
		this.addMember(new PartyMember());
	}
	this.setToken('party');

}

Party.prototype = new AttackerGroup();
Party.prototype.constructor = Party;

Party.prototype.addMember = function (member)
{
	member = member?member:new PartyMember();
	console.log(member);
	this.members.push(member);
	this.updateNode();
	return this;
};

Party.prototype.chooseNewMaze = function (maze)
{
	this.exploring = true;
	this.action = this.actions.exit;
	this.endPointFound = false;
	this.svgElement = null;
	this.route = [];
	this.maze = maze;
	this.currentCell = this.maze.startPoint.visit();
	this.draw();
	return this;
};

Party.prototype.draw = function ()
{
	var elem = this.getSvgElement();

	if (elem.parentNode)
	{
		elem.parentNode.removeChild(elem);
	}
	this.currentCell.getSvgElement().appendChild(elem);
};

Party.prototype.getSvgElement = function ()
{
	if (this.svgElement)
	{
		return this.svgElement;
	}
	//cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"
	var maze = this.currentCell.mazeReference,
			cx = maze.cellWidth / 2, cy = maze.cellHeight / 2,
			r = (cx > cy ? cy : cx) * 0.8;
	var circle = SVGHelper.createElement(
			'circle',
			{
				'cx': cx,
				'cy': cy,
				'r': r,
				'stroke-width': 1,
				'stroke': 'black',
				'fill': 'red'
			}
	);
	this.svgElement = circle;
	return circle;
};

Party.prototype.explore = function ()
{
	if (this.endPointFound)
	{
		this.exposeMap();
	}
	else
	{
		this.searchForEndPoint();
	}
	this.draw();
};

/**
 * The method by which the route from the start point to the end point is determined
 * @returns {null}
 */
Party.prototype.searchForEndPoint = function ()
{
	// go to the next cell on the route
	// check whether or not the current cell has any unvisited neighbours
	var unvisitedNeighbours = this.currentCell.getUnvisitedNeighbours();
	if (unvisitedNeighbours.length > 0)
	{
		Game.feedback("Moving along the maze", this.fbClasses.exploration);
		// we have an unvisited neighbour for the current cell.
		// We should choose the first one from the list and visit that one.
		var newCell = unvisitedNeighbours.pop();
		this.visitCell(newCell);
		// add that cell to the route list.
		this.route.push(newCell);
		this.currentCell = newCell;
		if (newCell.isEndPoint)
		{
			this.endPointFound = true;
			this.buildBackTrack();
			this.addXP(Math.pow(Game.mazesExplored + 1, 2));
		}
	}
	else
	{
		Game.feedback("Moving back along the route", this.fbClasses.exploration)
		// the path has currently not yielded the end point so keep removing points from it until
		// we get to a cell with unvisited neighbours and check them
		var currentCell = this.currentCell,
				// rather than remove it initially, we should ensure that the cell has only one
				// unvisited neighbour.
				previousCell = this.route.slice(-1).pop();


		if (previousCell.getUnvisitedNeighbours().length === 0)
		{
			// remove the previously visited cell from the stack.
			this.route.pop();
		}

		// no neighbouring cells are unvisited so we should backtrack
		this.currentCell = previousCell;
	}

};

Party.prototype.visitCell = function (cell)
{
	cell.visit(this);
	if(cell.hasMonsters())
	{
		Game.feedback("The party stumbles across some monsters", this.fbClasses.combat);
		this.combat = new Combat(this,cell.getMonsters());
	}
};

Party.prototype.addXP = function (amount)
{
	var memberXP = amount / this.members.length;
	var sumOfPartyLevels = 0;
	for(var i in this.members)
	{
		var member = this.members[i].addXP(memberXP);
		var level = member.getLevel();
		sumOfPartyLevels += level;
	}
	var newLevel = Math.floor(sumOfPartyLevels / this.members.length);
	if(this.level < newLevel)
	{
		for(var i = this.level; i < newLevel; i++)
		{
			this.tickTime *= this.tickTimeExponent;
			this.tickTime = Math.max(10, Math.floor(this.tickTime));
		}
		this.level = newLevel;
	}
	return this;
};

Party.prototype.exposeMap = function ()
{
	this.action = this.actions.fullExplore;
	var unvisitedNeighbours = this.currentCell.getUnvisitedNeighbours();
	if (unvisitedNeighbours.length > 0)
	{
		Game.feedback('Exploring dead end', this.fbClasses.exploration);
		// this part works exactly as the searchForEndPoint method
		// except it adds to the exposeRoute method instead of the route method
		var newCell = unvisitedNeighbours.pop();
		this.visitCell(newCell);

		// add that cell to the route list.
		this.exposeRoute.push(newCell);
		this.currentCell = newCell;
	}
	else if (this.maze.isFullyExplored() || this.mode === this.modes.speedRun)
	{
		if (this.currentCell.isEndPoint)
		{
			this.exploring = false;
			Game.feedback('Descending to next level', this.fbClasses.exploration);
		}
		else
		{
			this.action = this.actions.returnToExit;
			// the maze is currently explored so we just backtrack across the expose route until we're
			// back at the starting cell
			this.currentCell = this.exposeRoute.pop();
			Game.feedback('Returning to exit', this.fbClasses.exploration);
		}
	}
	else if (this.route.indexOf(this.currentCell) >= 0)
	{
		Game.feedback('Backtracking to explore map', this.fbClasses.exploration);
		// The current cell is in the route that took us here, so we look to the next one in the route
		var newCell = this.reversedRouteIterator.next().value[1];
		this.exposeRoute.push(newCell);
		this.currentCell = newCell;
	}
	else
	{
		var currentCell = this.currentCell,
				// rather than remove it initially, we should ensure that the cell has only one
				// unvisited neighbour.
				previousCell = this.exposeRoute.slice(-1).pop();

		if (previousCell.getUnvisitedNeighbours().length === 0)
		{
			// remove the previously visited cell from the stack.
			this.exposeRoute.pop();
		}

		// no neighbouring cells are unvisited so we should backtrack
		this.currentCell = previousCell;
	}
};

Party.prototype.buildBackTrack = function ()
{
	this.exposeRoute = [this.currentCell];
	this.reversedRouteIterator = this.route.slice(0, -1).reverse().entries();
};

Party.prototype.tick = function ()
{
	if (!this.processTicks)
	{
		return;
	}
	
	if(this.combat)
	{
		this.combat.tick();
		if(this.combat.isFinished())
		{
			this.combat = null;
		}
	}
	else if (this.exploring)
	{
		this.explore();
	}
	else
	{
		
	}
	
	var self = this;
	window.setTimeout(function () {
		self.tick();
	}, this.tickTime);
};

Party.prototype.start = function ()
{
	if (this.processTicks)
	{
		return;
	}
	this.processTicks = true;
	this.tick();
};

Party.prototype.stop = function ()
{
	this.processTicks = false;
};

Party.prototype.toJSON = function()
{
	var partyJSON = {
		members:[],
		currentCell:this.currentCell.toJSON(),
		route:[],
		action:this.action
	};
	
	for(var i in this.members)
	{
		partyJSON.members[i] = this.members[i].toJSON();
	}
	return partyJSON;
};

Party.prototype.isAlive = function()
{
	for(var i in this.members)
	{
		var member = this.members[i];
		var alive = member.isAlive();
		console.log('Member '+(parseInt(i)+1)+(member.name+' is ')+(alive?'alive':'dead'));
		console.log(member);
		if(alive)
		{
			console.log(member.name+' is alive');
			return true;
		}
	}
	return false;
};