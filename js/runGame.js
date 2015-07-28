"use strict";
/* 
 * This code remains the intellectual property of Éamonn "Wing" Kearns
 */
$(function()
{
	var $doc = $(document);
	
	var $gameUI = $('#gameUI');
	var width = $doc.width() - 20;
	var maxHeight = $doc.height() - 50;
	
	$gameUI
		.width(width)
		.height(maxHeight > 740 ? maxHeight : 740);
	
	Game.init({mazeElement:document.getElementById('mapOverlay')});
});