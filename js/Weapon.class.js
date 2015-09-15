/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Weapon()
{
	this.bonuses.dps = 10;
}

Weapon.prototype = new Equipment();
Weapon.prototype.constructor = Weapon;