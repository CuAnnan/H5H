/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var party;
	
var Game = Game?Game:{};
$(function()
{
	var $doc = $(document);
	var $gameUI = $('#gameUI');
	var width = $doc.width() - 20;
	var maxHeight = $doc.height() - 50;

	$gameUI
		.width(width)
		.height(maxHeight > 740 ? maxHeight : 740);

	var monsterFactory = new MonsterFactory();
	party = new Party();
	
	for(var i = 0; i < 20; i++)
	{
		console.log("Starting new combat");
		var combat = new Combat(
			party,
			monsterFactory.getNewMonsterGroupForParty(party)
		);

		while(combat.isOngoing())
		{
			combat.tick();
		}
	}
	
});