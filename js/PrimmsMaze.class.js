/* 
 * This code remains the intellectual property of Éamonn "Wing" Kearns
 */

/**
 * Constructor for the Primm's Maze
 * @param {DOMElement}		elem	The node into which to embed the SVG.
 * @param {Int}				cols	The number of columns in the map
 * @param {Int}				rows	The number of rows in the map
 * @param {ObjectLiteral}	options	An obhect literal containing any of the optional values that get
 *									defaulted if not provided (width, height, 
 * @returns {PrimmsMaze}
 */
function PrimmsMaze(elem, cols, rows, options)
{
	this.deferredConstructor(elem, cols, rows, options);
}

/*
 * Inherit from Maze
 */
PrimmsMaze.prototype = new Maze();
PrimmsMaze.prototype.constructor = PrimmsMaze;


/**
 * Overload the super maze method.
 * @returns {PrimmsMaze}
 */
PrimmsMaze.prototype.build = function()
{
	var currentCell = this.visitCell(Math.floor(Math.random() * this.rows),Math.floor(Math.random() * this.cols)),
		working = true,
		boundaryCells = [];
	
	while(working)
	{
		// check if there are any boundary cells for the current cell
		boundaryCells = boundaryCells.concat(this.getBoundaryCells(currentCell));
		this.randomizeCells(boundaryCells);
		var newCell = boundaryCells.pop();
		
	}
	return this;
};

PrimmsMaze.prototype.getBoundaryCells = function(givenCell)
{
	var cellBoundaryCells = [];
	
	if(givenCell.x > 0)
	{
		
	}
	
	return cellBoundaryCells;
};