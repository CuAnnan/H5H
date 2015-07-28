/* 
 * This code remains the intellectual property of Éamonn "Wing" Kearns
 */
(function(){
	var townSuffixes = ['ton', 'ville', 'berg', 'vale', 'ham', 'mouth', 'ford'],
		townMidfixes = ['Hungting', 'Inns', 'Bright', 'Black', 'Notting', 'Bally'],
		existingTowns = {},
		resourceTypes = ['Ore', 'Wood', 'Food'];
	
	
	function Town(name)
	{
		this.name = name;
		this.resourceProducers = {};
		for(var i in resourceTypes)
		{
			var type = resourceTypes[i];
			this.resourceProducers[resourceTypes[i]] = new ResourceProducer({type:resourceTypes[i]});
		}
	}
	
	Town.prototype.tick = function()
	{
		for(var i in resourceTypes)
		{
			
		}
	}
	
	function ResourceProducer(data)
	{
		this.type = data.type;
		this.level = data.level?data.level:0;
	}
	
	function getNewTown()
	{
		var townName = Game.randomArrayElement(townMidfixes)+Game.randomArrayElement(townSuffixes);
		while(existingTowns[townName])
		{
			townName = 'New ' + townName;
		}
		var town = new Town(townName);
		existingTowns[townName] = town;
		return town;
	}
	
	
	
	Game.Town = Town;
	Game.getNewTown = getNewTown;
})();
