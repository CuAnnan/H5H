"use strict";
var SVGHelper = SVGHelper?SVGHelper:{};
/**
 * 
 * @param {DOMElement}		elem	The node into which to embed the SVG.
 * @param {Int}				cols	The number of columns in the map
 * @param {Int}				rows	The number of rows in the map
 * @param {ObjectLiteral}	options	An obhect literal containing any of the optional values that get
 *									defaulted if not provided (width, height, 
 * @returns {Maze}
 */
function Maze(elem, cols, rows, options)
{
	if(arguments.length == 0)
	{
		// this is for the inheritance, I guess
		return;
	}
	this.deferredConstructor(elem, cols, rows, options);
}

/**
 *  * the functionality of the constructor is deferred to here, to allow the prototypical inheritance
 * to work easily. 
 * @param {type} elem
 * @param {type} cols
 * @param {type} rows
 * @param {type} options
 * @returns {undefined}
 */
Maze.prototype.deferredConstructor = function(elem, cols, rows, options)
{
	/*
	 * Build the SVG container
	 */
	this.svgNode = SVGHelper.createElement('svg');
	SVGHelper.emptyElement(elem);
	elem.appendChild(this.svgNode);
	this.element = SVGHelper.createElement('g');
	this.svgNode.appendChild(this.element);
	/*
	 * Default the instance variables
	 */
	this.rows = null;
	this.cols = null;
	this.cells = [];
	this.initialised = false;
	this.sparseCells = 0;
	this.emptyCells = 0;
	this.cellColor = 'white';
	this.wallThickness = 2;
	this.wallColor = 'black';
	this.startPointColor = 'lightblue';
	this.endPointColor = 'lightcoral';
	this.visitedCellsCount = 0;
	this.totalCellCount = rows * cols;
	
	// set the variables that need to be set for the system to work.
	this.setCols(cols).setRows(rows).setWidth().setHeight();	

	// take the options and use them to set values.
	for(var i in options)
	{
		if(i !== 'elem')
		{
			var fieldName = 'set'+i.ucFirst();
			this[fieldName](options[i]);
		}
	}
};

Maze.prototype.toJSON = function()
{
	var json = {
		width:this.width, height:this.height,
		rows:this.rows, cols: this.cols,
		cells:[]
	};
	
	for(var i in this.cells)
	{
		json.cells.push([]);
		for(var j in this.cells[i])
		{
			json.cells[i][j] = this.cells[i][j].toJSON();
		}
	}
	return json;
};

/**
 * @param {int} width
 * @returns {Maze}
 * Set the width and resize all of the elements
 */
Maze.prototype.setWidth = function(width)
{
	if(!width)
	{
		width = parseInt(window.getComputedStyle(this.svgNode.parentNode).width);
	}
	
	this.initialised = false;
	this.element.setAttribute('width', width);
	this.svgNode.setAttribute('width', width);
	this.width = width;
	return this;
};

Maze.prototype.setHeight = function(height)
{
	if(!height)
	{
		height = parseInt(window.getComputedStyle(this.svgNode.parentNode).height);
	}
	
	this.initialised = false;
	this.element.setAttribute('height', height);
	this.svgNode.setAttribute('height', height);
	this.height = height;
	return this;
};

Maze.prototype.setRows = function(rows)
{
	this.initialised = false;
	this.rows = rows;
	return this;
};

Maze.prototype.setCols = function(cols)
{
	this.initialised = false;
	this.cols = cols;
	return this;
};

Maze.prototype.setSparseness = function(sparseness)
{
	this.initialised = false;
	this.sparseCells = this.rows*this.cols*sparseness/100;
	this.emptyCells = 0;
	return this;
};

Maze.prototype.emptyElementNode = function()
{
	var child = this.element.firstChild;
	while(child)
	{
		this.element.removeChild(child);
		child = this.element.firstChild;
	}
};

/**
 * Build the map datastructure and traverse it to set the walls.
 * Uses the recursive backtrace found on wikipedia.
 * @returns {Map}
 */
Maze.prototype.build = function()
{
	var currentCell = this.visitCell(1, 1);
	var visitedCells = 0;
	var cells = new Array();
	cells.push(currentCell);
	var building = true;
	
	while(building)
	{
		var nextCell = this.pickRandomAdjacentCell(currentCell);
		if(nextCell)
		{
			cells.push(nextCell);
			currentCell = nextCell;
			visitedCells++;
		}
		else
		{
			currentCell = cells.pop();
		}
		if(!currentCell || visitedCells === this.width*this.height)
		{
			building = false;
		}
	}
	
	for(var i = 0; i < this.cols; i++)
	{
		for(var j = 0; j < this.rows; j++)
		{
			this.cells[i][j].visited = false;
		}
	}
	
	if(this.emptyCells > 0)
	{
		this.sparsify();
	}
	this.setStartAndEndPoints();
	return this;
};

Maze.prototype.randomizeCells = function(cellList)
{
	var currentIndex = cellList.length;
	
	while(0 !== currentIndex)
	{
		var randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex --;
		
		var temp = cellList[currentIndex];
		cellList[currentIndex] = cellList[randomIndex];
		cellList[randomIndex] = temp;
	}
	
	return cellList;
};

Maze.prototype.sparsify = function()
{
	while(this.emptyCells < this.sparseCells)
	{
		var testCells = new Array();
		for(var i = 0; i < this.cols; i++)
		{
			for(var j = 0; j < this.rows; j++)
			{
				if(this.emptyCells < this.sparseCells)
				{
					cell = this.cells[i][j].isDeadEnd();
					if(cell)
					{
						testCells.push(
							{
								'cell':this.cells[i][j],
								'direction':cell,
								i:i,j:j
							}
						);
					}
				}
			}
		}
		this.randomizeCells(testCells);
		for(var i = 0; i < testCells.length; i++)
		{
			var test = testCells[i];
			test.cell.replaceWall(test.direction);
			x = test.i; y = test.j;
			switch(test.direction)
			{
				case "North":
					this.cells[x-1][y].replaceWall('South');
					break;
				case "South":
					this.cells[x+1][y].replaceWall('North');
					break;
				case "East":
					this.cells[x][y+1].replaceWall('West');
					break;
				case 'West':
					this.cells[x][y-1].replaceWall('East');
			}
			this.emptyCells++;
		}
	}	
};

Maze.prototype.setStartAndEndPoints = function()
{
	var endPoint = null, startPoint = null, i = 0, j = 0;
	while(!startPoint)
	{
		var cell = this.cells[i][j];
		if(cell.isDeadEnd())
		{
			cell.setStartPoint();
			startPoint = cell;
		}
		else
		{
			i++;
			if(i == this.cols)
			{
				j++;
				i=0;
			}
		}
	}
	this.startPoint = startPoint;
	
	j = this.rows-1; i = this.cols-1;
	while(!endPoint)
	{
		var cell = this.cells[i][j];
		if(cell.isDeadEnd() && cell.x != startPoint.x && cell.y != startPoint.y)
		{
			cell.setEndPoint();
			endPoint = cell;
		}
		else
		{
			i--;
			if(i == -1)
			{
				j--;
				i = this.rows-1;
			}
		}
	}
	this.endPoint = endPoint;
};

Maze.prototype.initialise = function()
{
	if(this.initialised)
	{
		return this;
	}
	
	if(!this.rows)
	{
		throw CustomException('RowsNotSet', 'Maze Rows not set');
	}
	if(!this.cols)
	{
		throw CustomException('ColsNotSet', 'Maze Columns not set');
	}
	this.svgNode.setAttribute('viewBox', '0 0 '+this.width+' '+this.height);
	
	this.calculateDerived();
	
	this.emptyElementNode();
	this.build();
	
	this.initialised = true;
	return this;
};

Maze.prototype.calculateDerived = function()
{
	this.cellWidth = parseInt(this.width/this.rows);
	this.cellHeight = parseInt(this.height/this.cols);
	var paddingVertical =	((this.width%this.rows)?0:(this.width - this.cellWidth*this.rows)) +
							(this.element.getAttribute('width') - this.width),
		paddingHorizontal = ((this.height%this.cols)?0:(this.height - this.cellHeight*this.cols)) + 
							(this.element.getAttribute('height') - this.height);
		
	this.leftPadding = parseInt(paddingVertical/2);
	this.topPadding = parseInt(paddingHorizontal/2);
	
	for(var j = 0; j < this.cols; j++)
	{
		var cellRow = new Array();
		for(var i = 0; i < this.rows; i++)
		{
			cellRow.push(new Cell(i, j, this));
		}
		this.cells.push(cellRow);
	}
};

Maze.prototype.visitCell = function(x, y)
{
	var visitedCell = this.cells[x][y];
	visitedCell.visited = true;
	return visitedCell;
};


Maze.prototype.pickRandomAdjacentCell = function(cell)
{
	if(!cell)
	{
		throw CustomException('NoCellFound', "No Cell found");
	}
	var self = this;
	var directions = {
		names:new Array('North', 'South', 'East', 'West'),
		value:{
			'North':{name:'North', tested: false, x:0, y:-1},
			'South':{name:'South', tested: false, x:0, y:+1},
			'East':{name:'East', tested: false, x:+1, y:0},
			'West':{name:'West', tested: false, x:-1, y:0}
		},
		length:4,
		pickRandom:function()
		{
			self.randomizeCells(this.names);
			var direction = this.names.pop();
			this.length = this.names.length;
			this.value[direction].tested = true;
			return this.value[direction];
		}
	};
	
	var adjacentCell = null;
	var dir = null;
	while(!adjacentCell && directions.length > 0)
	{
		dir=directions.pickRandom();
		var newX = cell.x+dir.x;
		var newY = cell.y+dir.y;
		if(newX>=0 && newX < this.rows && newY >=0 && newY < this.cols)
		{
			var testCell = this.cells[newY][newX];
			if(!testCell)
			{
				throw CustomException('NoCellFound', "No Cell found");
			}
			if(!testCell.visited)
			{
				adjacentCell = testCell;
				testCell.visited = true;
			}
		}
	}
	
	if(adjacentCell)
	{
		cell.connectCellTo(dir.name, adjacentCell);
		return adjacentCell;
	}
};

Maze.prototype.draw = function()
{
	if(!this.initialised)
	{
		this.initialise();
	}
	
	for(var i = 0; i < this.cols; i++)
	{
		for(var j = 0; j < this.rows; j++)
		{
			var cell = this.cells[i][j];
			var g = cell.getSvgElement();
			g.setAttribute('transform', 'translate('+(j * this.cellHeight)+', '+(i * this.cellWidth)+')');
			this.element.appendChild(g);
		}
	}
	
	return this;
};

Maze.prototype.expose = function()
{
	for(var i = 0; i < this.cols; i++)
	{
		for(var j = 0; j < this.rows; j++)
		{
			var cell = this.cells[i][j];
			cell.show();
		}
	}
	
};

Maze.prototype.getStartingCell = function()
{
	return this.startPoint;
};

Maze.prototype.isFullyExplored = function()
{
	return this.visitedCellsCount == this.totalCellCount;
};

Maze.prototype.hasUnvisitedCells = function()
{
	return !this.isFullyExplored();
};

Maze.prototype.getCellCount = function()
{
	return this.cols * this.rows;
};
