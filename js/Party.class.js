"use strict";
var SVGHelper = SVGHelper ? SVGHelper : {};
/* 
 * This code remains the intellectual property of Éamonn "Wing" Kearns
 */
function Party(members)
{
	// an array to hold the party members
	this.members = [];
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
}

Party.prototype.addMember = function (member)
{
	member = member?member:new PartyMember();
	if(member instanceof PartyMember)
	{
		this.members.push(member);
	}
	$('#party').append(member.getElement());
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
		// we have an unvisited neighbour for the current cell.
		// We should choose the first one from the list and visit that one.
		var newCell = unvisitedNeighbours.pop();
		this.visitCell(newCell);
		// add that cell to the route list.
		this.route.push(newCell);
		this.currentCell = newCell;
		if (newCell.isEndPoint)
		{
			this.route.push(this.currentCell);
			this.endPointFound = true;
			this.buildBackTrack();
			this.addXP(Math.pow(Game.mazesExplored + 1, 2));
		}
	}
	else
	{
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
	cell.visit();
	this.addXP(1);
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

/*
Party.prototype.addXP = function (amount)
{
	this.xp += amount;
	while (this.xp >= this.xpToLevel)
	{
		this.level++;
		this.xpToLevel += this.level * this.levelStep;
		this.tickTime *= Math.floor(this.tickTimeExponent);
		this.tickTime = Math.max(10, this.tickTime);
	}
};
*/

Party.prototype.exposeMap = function ()
{
	this.action = this.actions.fullExplore;
	var unvisitedNeighbours = this.currentCell.getUnvisitedNeighbours();
	if (unvisitedNeighbours.length > 0)
	{
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
		}
		else
		{
			this.action = this.actions.returnToExit;
			// the maze is currently explored so we just backtrack across the expose route until we're
			// back at the starting cell
			this.currentCell = this.exposeRoute.pop();
		}
	}
	else if (this.route.indexOf(this.currentCell) >= 0)
	{
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
	this.exposeRoute = [];
	this.reversedRouteIterator = this.route.slice().reverse().entries();
};

Party.prototype.tick = function ()
{
	if (!this.processTicks)
	{
		return;
	}

	if (this.exploring)
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
