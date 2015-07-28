/* 
 * This code remains the intellectual property of Éamonn "Wing" Kearns
 */
"use strict";
var SVGHelper = {};
(
	function()
	{
		var xmlns = xmlns?xmlns:'http://www.w3.org/2000/svg';
		
		SVGHelper.createElement = function(nodeType, attributes)
		{
			var node = document.createElementNS(xmlns, nodeType);
			for(var i in attributes)
			{
				if(typeof attributes[i] === "undefined")
				{
					var e = new CustomException('UnexepectedValueError', 'Undefined value for '+i);
					console.warn(e.stack);
					throw e;
				}
				node.setAttribute(i, attributes[i]);
			}
			return node;
		};
		SVGHelper.emptyElement = function(element)
		{
			var child = element.firstChild;
			while(child)
			{
				element.removeChild(child);
				child = element.firstChild;
			}
		};
	}
)();