/**
 * Controllerek őse, ami közös a kliens és a szerver kezelésében az itt található
 */
import Vector from "./Vector";
import Player from "./Player";
import Castle from "./Castle";
import UnitLine from "./UnitLine";
import Observer from "./Observer";

import {StringHash, NumberHash} from "./Hash";

import Controller = require("../common/controller");

// Lelket add a játéknak, eltelt idő, események kezelése, heartbeat
export class GameManager {
	protected castles: NumberHash<Castle> = {};
	protected unitLines: StringHash<UnitLine> = {};
	protected players: StringHash<Player> = {};
	protected playersNumber: number;
	protected elapsedTime : number;

	protected cuttingQueue = new Array();
	
	protected timer;

	constructor() {
	}

	public start(): void { }

    public end(): void { }

	public getNumberOfPlayer(): number {
		return this.playersNumber;
	}

	public addPlayer(newPlayer: Player) {
		this.players[newPlayer.name] = newPlayer;
		this.playersNumber++;
	}

	public addCastle(newCastle: Castle) {
		this.castles[newCastle.id] = newCastle;
	}

	public getCastles(): NumberHash<Castle> {
		return this.castles;
	}

	public getUnitLines(): StringHash<UnitLine> {
		return this.unitLines;
	}
	
	//-----------------------------------------
	// Tick functions
	//-----------------------------------------
	
	public tick() {
		this.elapsedTime++;
		this.eventsProcessing();
		this.lineTicks();
		this.castleTicks();
	}
	
	public lineTicks() {
		for (var lineId in this.unitLines) {
			var unitLine = this.unitLines[lineId];
			unitLine.tick();
			if (unitLine.isCutted && unitLine.units.length == 0) {
				// lehet hogy a másikból is kell, és lehet így nem lehet törölni
                this.castles[unitLine.castleIdFrom].unitLineIds = this.castles[unitLine.castleIdFrom].unitLineIds.splice(parseInt(lineId), 1);
                this.castles[unitLine.castleIdTo].unitLineIds = this.castles[unitLine.castleIdTo].unitLineIds.splice(parseInt(lineId), 1);
				delete this.unitLines[lineId];
			}
		}
	}

	public castleTicks() {
		for (var castleId in this.castles) {
			var castle = this.castles[castleId];
			if (this.castles[castleId].tick()) {
				for (var index = 0; index < castle.unitLineIds.length; index++) {
					var unitLineId = castle.unitLineIds[index];
					var unitLine = this.unitLines[unitLineId];
					if (!unitLine.isCutted) {
						unitLine.addUnit(castle.units);
						castle.removeUnit();
					}
				}
			}
		}
	}

	public getUnitLineFromTo(from: Castle, toId: number): UnitLine {
        if (from.id != toId) {
            for (var index = 0; index < from.unitLineIds.length; index++) {
                var unitLineId = from.unitLineIds[index];
                var unitLine = this.unitLines[unitLineId];
                if (this.unitLines[unitLineId].castleIdTo == toId) {
                    return unitLine;
                }
            }
        } else {
            return null;
        }
	}


	public checkCollisions(): number[] {
		var unitRemoved: number[] = new Array();

		for (var unitLineId in this.unitLines) {

			var unitLine = this.unitLines[unitLineId];
			var targetCastle: Castle = this.castles[unitLine.castleIdTo];
			//			var oppositLine = targetCastle.getUnitLineTo(unitLine.castleIdFrom);
			var oppositLine = this.getUnitLineFromTo(targetCastle, unitLine.castleIdFrom);
			
			// Unitline with Unitline
			if (!unitLine.isItEmpty()) {
				if (oppositLine != null && !oppositLine.isItEmpty() && (oppositLine.castleIdFrom != unitLine.castleIdFrom)) {
					//if(!oppositLine.isItEmpty()) {
					if (oppositLine.units[0].collisionWithUnit(unitLine.units[0])) {
						unitRemoved.push(unitLine.removeFirst().id);
						unitRemoved.push(oppositLine.removeFirst().id);
					}
					//}
				} else {
					if (targetCastle.collisionWithUnit(unitLine.units[0])) {
						// Ha saját vagy nem vizsgálat
						if (targetCastle.owner.id == unitLine.owner.id) {
							unitRemoved.push(unitLine.removeFirst().id);
							targetCastle.addUnit();
						} else {
							unitRemoved.push(unitLine.removeFirst().id);
							if (!targetCastle.removeUnit()) {
								targetCastle.owner = unitLine.owner;
								targetCastle.addUnit();
							}
						}
					}
				}
			}
		}
		return unitRemoved;
	}
	
		// It helps to keep the data consistence
	protected eventsProcessing() {
		while(this.cuttingQueue.length > 0) {
		//for (var index = 0; index < this.cuttingQueue.length; index++) {
//	        var cut = this.cuttingQueue[index];
	        var cut = this.cuttingQueue.shift();
	        var unitLine = this.unitLines[cut["unitLineId"]];
			if(!unitLine.isCutted) {
				var cuttingIndex = cut["cuttingIndex"];
				console.log("Lefut");
				var newUnitLine = new UnitLine(unitLine.owner, unitLine.castleIdFrom, unitLine.castleIdTo, unitLine.startPoint.clone(), unitLine.direction.multiply(4));
				this.unitLines[newUnitLine.id] = newUnitLine;

				newUnitLine.isCutted = true;
				unitLine.isCutted = true;

				while (cuttingIndex >= 0) {
					var unit = unitLine.units.shift();
					unit.velocity = unit.velocity.multiply(4);
					newUnitLine.units.push(unit);
					cuttingIndex--;
				}
				if (newUnitLine.units.length > 0) {

					this.castles[unitLine.castleIdFrom].addUnitLine(newUnitLine.id);

					for (var index = 0; index < unitLine.units.length; index++) {
						var unit = unitLine.units[index];
						unit.velocity = unit.velocity.multiply(-4);
						unitLine.castleIdTo = unitLine.castleIdFrom;
					}
					unitLine.units = unitLine.units.reverse();
				}
			}
		}
	}

}

//-----------------------------------------
// Interfaces
//-----------------------------------------

export interface Observerable {
	observers: Observer[];
	registerObserver(ob: Observer);
	requestSynchronization();
	notifyObservers(unitRemoved: number[]);
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

// Akik ezt implementálják, azokhoz tudnak csatlakozni controllerek
export interface Controllable {
	// Ez nem biztos, hogy kell
	//controllers : Controller.Controller[];
	//registerController(cr : Controller.Controller);
	
	//------Validation needed---------
	// Lehetne game id-val és akkor kastély kastély player
	sendUnits(player: Player, from: number, to: number);
	cutLines(player: Player, dict: NumberHash<Vector>);
	ready(player: Player);
}