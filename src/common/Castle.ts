import Vector from "Vector";
import Player from "Player";
import Tickable from "Tickable";
import SynchronUtility from "SynchronUtility";
import Unit from "Unit";

class Castle implements Tickable {
	id: number;
	units: number;
	maxUnits: number;

	growCounter: number;
	emitterCounter: number;

	forbiddenCastles: number[];
	unitLineIds: number[];

	owner: Player;
	position: Vector;

	static buildFromObject(object: Castle): Castle {
		var position: Vector = Vector.buildFromObject(object.position);
		var player: Player = Player.buildFromObject(object.owner);
		var result: Castle = new Castle(object.units, object.maxUnits, position);
		result.id = object.id;
		result.owner = player;
		result.growCounter = object.growCounter;
		result.unitLineIds = object.unitLineIds;
		result.forbiddenCastles = object.forbiddenCastles;
		result.emitterCounter = object.emitterCounter;
		//		for(var unitLineId in object.unitLines) {
		//			result.unitLines[unitLineId] = UnitLine.buildFromObject(object.unitLines[unitLineId]);
		//		}
		return result;
	}

	constructor(units: number, maxUnits: number, position: Vector) {
		this.units = units;
		this.maxUnits = maxUnits;
		this.position = position;

		this.emitterCounter = 0;
		this.growCounter = 0;
		this.id = SynchronUtility.getNextId();
		this.unitLineIds = new Array();
		this.forbiddenCastles = new Array();
	}

	public setOwner(newOwner: Player) {
		this.owner = newOwner;
	}

	public tick(): boolean {
		//		if(this.growUnits()) {
		//			for(var unitLineId in this.unitLines) {
		//				var unitLine : UnitLine = this.unitLines[unitLineId];
		//				unitLine.addUnit(this.units);
		//			}
		//		}
		this.growUnits();
		this.emitterCounter++;
		if (this.emitterCounter > 50) {
			this.emitterCounter = 0;
			return true;
		}
		return false;
	}

	//	addUnitLine(unitLine : UnitLine) {
	//		this.unitLines[unitLine.id] = unitLine;
	//	}

	//	removeUnitLine(unitLineId : number) {
	//		delete this.unitLines[unitLineId];
	//	}

	addUnitLine(unitLineId: number) {
		this.unitLineIds.push(unitLineId);
	}

	removeUnitLine(unitLineId: number) {
		delete this.unitLineIds[unitLineId];
	}

	// Ha volt növekedés akkor igazzal tér vissza
	growUnits(): boolean {
		var result;
		// TODO unit szám kalkuláció
		this.growCounter += this.units / 4000.0;
		if (this.growCounter > 1) {
			this.growCounter = this.growCounter - 1;
			result = true;

			this.units++;
			if (this.units > this.maxUnits) {
				this.units = this.maxUnits;
			}
		} else {
			result = false;
		}
		return result;
		//console.log(this.id + " growed to " + Math.round(this.units));
	}

	public addUnit() {
		this.units++;
	}

	/**
	 * If the castle is empty return with false
	 * @returns {boolean}
	 */
	public removeUnit(): boolean {
		this.units--;
		if (this.units < 0) {
			return false;
		}
		return true;
	}

	public getUnitLineIds() {
		return this.unitLineIds;
	}

	//	public getUnitLineTo(castleId : number) : UnitLine {
	//		for(var unitLineId in this.unitLines) {
	//			var unitLine = this.unitLines[unitLineId];
	//			if(unitLine.castleIdTo == castleId) {
	//				return unitLine;
	//			}
	//			return null;
	//		}
	//	}

	public collisionWithUnit(unit: Unit) {
		var castleSize = 20 + this.units / 4;
		if (this.position.substract(unit.position).getLength() < 10 + castleSize) {
			return true;
		} else {
			return false;
		}
	}

	public printToConsole() {
		console.log(this.id);
		console.log(this.units);
		this.position.printToConsole();
		this.owner.printToConsole();
	}
}

export default Castle;