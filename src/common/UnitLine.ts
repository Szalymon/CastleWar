import Vector from "./Vector";
import Player from "./Player";
import Tickable from "./Tickable";
import SynchronUtility from "./SynchronUtility";
import Unit from "./Unit";

class UnitLine implements Tickable {
	id: number;
	owner: Player;
	//unitsFrom : Unit[];
	castleIdFrom: number;
	castleIdTo: number;

	isCutted: boolean = false;

	units: Unit[];

	direction: Vector;
	startPoint: Vector;
	//unitsTo : Unit[];
	//direction : Vector;

	constructor(player: Player, castleIdFrom: number, castleIdTo: number, startPoint: Vector, direction: Vector, id?: number) {
		this.id = id || SynchronUtility.getNextId();

		this.units = new Array();
		this.owner = player;
		this.castleIdFrom = castleIdFrom;
		this.castleIdTo = castleIdTo;
		this.direction = direction;
		this.startPoint = startPoint;
	}

	static buildFromObject(object: UnitLine): UnitLine {
		var player = Player.buildFromObject(object.owner);
		var startPoint = Vector.buildFromObject(object.startPoint);
		var direction = Vector.buildFromObject(object.direction);
		var result = new UnitLine(player, object.castleIdFrom, object.castleIdTo, startPoint, direction, object.id);
		for (var unitId in object.units) {
			result.units[unitId] = Unit.buildFromObject(object.units[unitId]);
		}
		return result;
	}

	addUnit(castleSize: number) {
		var startVelocity = this.getUnitStartVelocity();

		this.units.push(new Unit(this.startPoint, startVelocity));
	}

	private getUnitStartVelocity(): Vector {
		return this.direction;
	}

	public isItEmpty(): boolean {
		if (this.units.length == 0) {
			return true;
		} else {
			return false;
		}
	}

	public tick() {
		this.units.forEach(function (unit: Unit) {
			unit.tick();
		});
	}

	public printToConsole() {
		console.log("UnitLine: " + this.id);
		//this.castleFrom.printToConsole();
		//this.castleTo.printToConsole();
	}

	public removeFirst(): Unit {
		return this.units.shift();
	}
}

export default UnitLine;