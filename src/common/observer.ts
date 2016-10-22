/**
 * Controllerek őse, ami közös a kliens és a szerver model kezelésében az itt található
 */

import {StringHash, NumberHash} from "./Hash";
import Castle from "./Castle";
import UnitLine from "./UnitLine";

interface Observer {
	loadCastles(castles:NumberHash<Castle>);
	loadUnitLines(unitLines:StringHash<UnitLine>);
	
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