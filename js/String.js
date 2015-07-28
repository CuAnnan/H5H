/* 
 * This code remains the intellectual property of Éamonn "Wing" Kearns
 */


String.prototype.ucFirst = function()
{
	return this.charAt(0).toUpperCase() + this.slice(1);
};