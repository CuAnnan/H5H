"use strict";
var SVGHelper = SVGHelper?SVGHelper:{};
function Cell(x, y, mazeReference)
{
	this.walls = {
		North:true,
		South:true,
		East:true,
		West:true,
		count:4
	};
	this.x = x;
	this.y = y;
	this.mazeReference = mazeReference;
	this.visited = false;
	this.isStartPoint = false;
	this.isEndPoint = false;
	this.connections = {};
	this.monsters = [];
	this.svgGroup = null;
}

Cell.prototype.toJSON = function()
{
	var cellAsJSON = {
		walls:this.walls,
		x:this.x,y:this.y,
		visited:this.visited
	};
	return cellAsJSON;
};

Cell.prototype.setWallColor = function(wallColor)
{
	this.wallColor = wallColor;
	return this;
};

Cell.prototype.setWallThickness = function(wallThickness)
{
	this.wallThickness = wallThickness;
	return this;
};

Cell.prototype.setTileColor = function(tileColor)
{
	this.tileColor = tileColor;
	return this;
};

Cell.prototype.setEmptyTileColor = function(emptyTileColor)
{
	this.emptyTileColor = emptyTileColor;
	return this;
};

Cell.prototype.setStartPoint = function()
{
	this.isStartPoint = true;
	return this;
};

Cell.prototype.setEndPoint = function()
{
	this.isEndPoint = true;
	return this;
};

Cell.prototype.replaceWall = function(direction)
{
	this.walls[direction] = true;
	this.walls.count++;
	return this;
};

Cell.prototype.removeWall = function(direction)
{
	this.walls[direction] = false;
	this.walls.count--;
	return this;
};

Cell.prototype.isDeadEnd = function()
{
	if(this.walls.count == 3)
	{
		for(var i in this.walls)
		{
			if(i != 'count' && !this.walls[i])
			{
				return i;
			}
		}
	}
	return false;
};

Cell.prototype.isEmpty = function()
{
	return (this.walls.count==4);
};

Cell.prototype.determineBGColor = function()
{
	var color = this.mazeReference.cellColor;
	if(this.isStartPoint)
	{
		color = this.mazeReference.startPointColor;
	}
	else if(this.isEndPoint)
	{
		color = this.mazeReference.endPointColor;
	}
	else if(this.walls.count == 4)
	{
		color = this.mazeReference.wallColor;
	}
	return color;
};

Cell.prototype.createWallElement = function(attrs)
{
	return SVGHelper.createElement(
		'line',
		{
			x1:attrs.x1, y1: attrs.y1, x2: attrs.x2, y2: attrs.y2,
			stroke: this.mazeReference.wallColor, 'stroke-width':this.mazeReference.wallThickness
		}
	);
};

Cell.prototype.getSvgElement = function()
{
	if(this.svgGroup)
	{
		return this.svgGroup;
	}
	
	var group = SVGHelper.createElement('g'),
		self = this;
	this.svgGroup = group;
	group.addEventListener('click', function(){
		console.debug(self, self.visited);
	});
	group.appendChild(
		SVGHelper.createElement(
			'rect',
			{
				x:0, y:0, 
				width: this.mazeReference.cellWidth, 
				height:this.mazeReference.cellHeight,
				stroke: 'black', fill:'black'
			}
		)
	);
	
	if(this.visited)
	{
		this.show();
	}
	return group;
};

Cell.prototype.show = function()
{
	var group = this.getSvgElement(),
		color = this.determineBGColor();
	SVGHelper.emptyElement(group);
	
	group.appendChild(
		SVGHelper.createElement(
			'rect',
			{
				x:this.mazeReference.wallThickness, y:this.mazeReference.wallThickness, 
				width: this.mazeReference.cellWidth-this.mazeReference.wallThickness, 
				height:this.mazeReference.cellHeight-this.mazeReference.wallThickness,
				stroke: color, fill:color
			}
		)
	);
	
	if(this.walls.North)
	{
		group.appendChild(
			this.createWallElement({
				x1:0 , x2: this.mazeReference.cellWidth,
				y1: 0, y2:0
			})
		);
	}
	if(this.walls.South)
	{
		group.appendChild(
			this.createWallElement({
				x1:0, x2: this.mazeReference.cellWidth,
				y1:this.mazeReference.cellHeight, y2: this.mazeReference.cellHeight
			})
		);
	}
	if(this.walls.East)
	{
		group.appendChild(
			this.createWallElement({
				x1:this.mazeReference.cellWidth, x2:this.mazeReference.cellWidth,
				y1:0, y2:this.mazeReference.cellHeight
			})
		);
	}
	if(this.walls.West)
	{
		group.appendChild(
			this.createWallElement({
				x1:0, x2:0, y1:0, y2:this.mazeReference.cellHeight
			})
		);
	}
};

Cell.prototype.getProfile = function()
{
	var profile = '';
	for(var i in this.walls)
	{
		if(i != 'count')
		{
			profile += this.walls[i]?'1':'0';
		}
	}
	return profile;
};

Cell.prototype.connectCellTo = function(direction, otherCell)
{
	// set up the opposing directions
	var oppositeCellWalls = {'North':'South', 'South':'North', 'West':'East', 'East':'West'};
	var opposite = oppositeCellWalls[direction];
	
	// make the connections between the two cells 
	this.connections[direction] = otherCell;
	otherCell.connections[opposite] = this;
	
	// remove the walls
	this.removeWall(direction);
	otherCell.removeWall(opposite);
};

Cell.prototype.connectsToEnd = function()
{
	for(var i in this.connections)
	{
		if(this.connections[i].endPoint)
		{
			return i;
		}
	}
	return false;
};

Cell.prototype.hasMonsters = function()
{
	return this.monsters.length > 0;
};

/**
 * Get the list of unvisited neighbours for the current cell.
 * @returns {Array} The list of unvisited neighbours
 */

Cell.prototype.getUnvisitedNeighbours = function()
{
	var unvisitedNeighbours = [];
	for(var i in this.connections)
	{
		if(this.connections[i].visited === false)
		{
			unvisitedNeighbours.push(this.connections[i]);
		}
	}
	return unvisitedNeighbours;
};

/**
 * Check whether or not the current cell has unvisited neighbours
 * @returns {Boolean} Whether or not the current cell has unvisited neighbours
 */
Cell.prototype.hasUnvisitedNeighbours = function()
{
	var unvisitedNeighbours = this.getUnvisitedNeighbours();
	return unvisitedNeighbours.length > 0;
};

Cell.prototype.visit = function()
{
	if(!this.visited)
	{
		this.show();
		this.mazeReference.visitedCellsCount++;
	}
	this.visited = true;
	return this;
};
