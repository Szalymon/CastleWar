/**
 * A játék állapotát, leíró osztályok halmaza
 */

// Lehet, hogy majd egy külső utils csomagba kellene majd rakni ezeket
export class Vector {
	x : number;
	y : number;
	
	constructor(x : number, y : number) {
		this.x = x;
		this.y = y;
	}
	
	public multiply(a : number) {
		return new Vector(this.x*a, this.y*a);
	}
	
	public cross(other : Vector) : number {
		return this.x*other.y + this.y * other.x; 
	}
	
	public distance(other : Vector) : number {
		return this.substract(other).getLength();
	}
	
	public printToConsole() : void {
		console.log("(x : " + this.x + ", y : " + this.y + ")");
	}
	
	static buildFromObject(object:Vector) : Vector {
		return new Vector(object.x, object.y);
	}
	
	public getLength() : number {
		return Math.sqrt(this.x*this.x + this.y*this.y);
	}
	
	public getNormalized() {
		var length = this.getLength();
		return new Vector(this.x/length, this.y/length);
	}
	
	public substract(v : Vector) {
		return new Vector(this.x - v.x, this.y - v.y);
	}
	
	public add(v : Vector) {
		return new Vector(this.x + v.x, this.y + v.y);
	}
	
	public clone() {
		return new Vector(this.x, this.y);
	}
}
//--------

// Majd a felelőségek leírása
export class Utils {
	private static idSeck : number;
	public static removedOnes : number[]; 
	// TODO Eltelt idő, a játék kezdete óta
	
	public static initialize() {
		Utils.idSeck = Number.MIN_VALUE;
		Utils.removedOnes = new Array();
	}
	
	public static getNextId() : number {
		this.idSeck++;
		return this.idSeck;
	}
}

export interface Tickable {
	id:number;
	tick():void;
}

export interface PlayerDictionary {
	[index : string] : Player;
}

export class Player {
	id : number;
	name : string;
	
	constructor(name? : string) {
		this.id = Utils.getNextId();
		this.name = name || "player" + this.id;
	}
	
	static buildFromObject(object:Player) : Player {
		var result:Player = new Player(object.name);
		result.id = object.id;
		return result;
	}
	
	public printToConsole() {
		console.log("player: " + this.name + " with id: " + this.id);
	}
}

export class Castle implements Tickable {
	id : number;
	units : number;
	maxUnits : number;
	
	growCounter : number;
	emitterCounter : number;
	
	forbiddenCastles : number[];
	unitLineIds : number[];
	
	owner : Player;
	position : Vector;
	
	static buildFromObject(object : Castle) : Castle {
		var position:Vector = Vector.buildFromObject(object.position);
		var player:Player = Player.buildFromObject(object.owner);
		var result:Castle = new Castle(object.units, object.maxUnits, position);
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
	
	constructor(units : number, maxUnits : number, position : Vector) {
		this.units = units;
		this.maxUnits = maxUnits;
		this.position = position;

		this.emitterCounter = 0;
		this.growCounter = 0;
		this.id = Utils.getNextId();
		this.unitLineIds = new Array();
		this.forbiddenCastles = new Array();
	}
	
	public setOwner(newOwner:Player) {
		this.owner = newOwner;
	}
	
	public tick() : boolean {
//		if(this.growUnits()) {
//			for(var unitLineId in this.unitLines) {
//				var unitLine : UnitLine = this.unitLines[unitLineId];
//				unitLine.addUnit(this.units);
//			}
//		}
		this.growUnits();
		this.emitterCounter++;
		if(this.emitterCounter > 50) {
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

	addUnitLine(unitLineId : number) {
		this.unitLineIds.push(unitLineId);
	}
	
	removeUnitLine(unitLineId : number) {
		delete this.unitLineIds[unitLineId];
	}
	
	// Ha volt növekedés akkor igazzal tér vissza
	growUnits() : boolean {
		var result;
		// TODO unit szám kalkuláció
		this.growCounter += this.units/4000.0;
		if(this.growCounter > 1) {
			this.growCounter = this.growCounter - 1;
			result = true;
			
			this.units++;
			if(this.units > this.maxUnits) {
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
	public removeUnit() : boolean {
		this.units--;
		if(this.units < 0) {
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
	
	public collisionWithUnit(unit : Unit) {
		var castleSize = 20 + this.units/4;
		if(this.position.substract(unit.position).getLength() < 10 + castleSize) {
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

// Elkéri a kastélytól az egységeket
// vágáskor százalékosan a szakasz hosszának megfelőlen megosztani az egységeket
export class UnitLine implements Tickable {
	id : number;
	owner:Player;
	//unitsFrom : Unit[];
	castleIdFrom : number;
	castleIdTo : number;
	
	isCutted : boolean = false;
	
	units : Unit[];
	
	direction : Vector;
	startPoint : Vector;
	//unitsTo : Unit[];
	//direction : Vector;
	
	constructor(player : Player, castleIdFrom : number, castleIdTo : number, startPoint : Vector, direction : Vector, id? : number) {
		this.id = id || Utils.getNextId();

		this.units = new Array();
		this.owner = player;
		this.castleIdFrom = castleIdFrom;
		this.castleIdTo = castleIdTo;
		this.direction = direction;
		this.startPoint = startPoint;
	}
	
	static buildFromObject(object : UnitLine) : UnitLine {
		var player = Player.buildFromObject(object.owner);
		var startPoint = Vector.buildFromObject(object.startPoint);
		var direction = Vector.buildFromObject(object.direction);
		var result = new UnitLine(player, object.castleIdFrom, object.castleIdTo, startPoint, direction, object.id);
		for( var unitId in object.units ) {
			result.units[unitId] = Unit.buildFromObject(object.units[unitId]);
		}
		return result;
	} 
	
	addUnit(castleSize : number) {
		var startVelocity = this.getUnitStartVelocity();
		
		this.units.push(new Unit(this.startPoint, startVelocity));
	}
	
	private getUnitStartVelocity() : Vector {
		return this.direction;
	}
	
	public isItEmpty() : boolean {
		if(this.units.length == 0) {
			return true;
		} else {
			return false;
		}
	}
	
	public tick() {
		this.units.forEach(function(unit:Unit) {
			unit.tick();
		});
	}
	
	public printToConsole() {
		console.log("UnitLine: " + this.id);
		//this.castleFrom.printToConsole();
		//this.castleTo.printToConsole();
	}
	
	public removeFirst() : Unit{
		return this.units.shift();
	}
}

export class Unit implements Tickable {
	id : number;
	position : Vector;
	velocity : Vector;
	
	constructor(position : Vector, velocity : Vector, id? : number) {
		this.position = position.clone();
		this.velocity = velocity.clone();
		
		this.id = id || Utils.getNextId();
	}
	
	public static buildFromObject(object : Unit) : Unit {
		var position = Vector.buildFromObject(object.position);
		var velocity = Vector.buildFromObject(object.velocity);
		var result = new Unit(position, velocity,  object.id);
		return result;
	} 
	
	public tick() {
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
	
	public printToConsole() {
		console.log("Unit: " + this.id);
		this.position.printToConsole();
		this.velocity.printToConsole();
	}
	
	public collisionWithUnit(other : Unit) : boolean {
		if(this.position.substract(other.position).getLength() < 20) {
			return true;
		} else {
			return false;
		}
	}
}

//-----------------------------------------
// Dictionary definitions
//-----------------------------------------

export interface UnitLineDictionary {
	[index: string]: UnitLine;
}

export interface CastleDictionary {
	[index: number]: Castle;
}

export interface VectorDictionary {
	[index: number]: Vector;
}

interface HashMap<T> {
	[index: number] : T;
}