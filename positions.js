// This is the "positions.js" file. The idea is that it wil contain 
// a long, long list of positions for each character in the game - 
// the bishop, priests and deacons. The positions is simply an array,
// with each position being a box X and Y corrdinate. In our game, 
// the grid consists of 12 x 12 boxes, so a character can be anywhere
// from boxX and boxY 0 - 11. Each value of the arrays is an another array
// and can contain either: 1. box x and y position which the character will
// move to during the game, or 2. a string with the value "wait" and
// the number of seconds you want the character to wait at its 
// position for.

var bishopPositions = [
						[7, 11], 
						["wait", 5], 
						[7, 9]
					  ];