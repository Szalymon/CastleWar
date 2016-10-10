/**
 * Controllerek őse, ami közös a kliens és a szerver model kezelésében az itt található
 */

import Model = require("../common/model");

interface Observer {
	//loadPlayers(player:Model.Player[]);
	loadCastles(castles:Model.CastleDictionary);
	loadUnitLines(unitLines:Model.UnitLineDictionary);
	
	unitRemoved(unitIds : number[]);
	
	gameHasStarted();
	gameHasEnded();
	// Most legyen csak teljes adat betöltés mert az ígyis úgyis kell
	
	/*
		Események:
			- Játék kezdete
			- Egy kastélyt elfoglaltak
			- Létre jött egy Unit line
			- El lett vágva egy Unit line
			- Játék vége
			- ?Szinkronizáció
	*/
}

export default Observer;