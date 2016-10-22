import Vector from "./Vector";
import Player from "./Player";
import Tickable from "./Tickable";
import SynchronUtility from "./SynchronUtility";

class Unit implements Tickable {
	id: number;
	position: Vector;
	velocity: Vector;

	constructor(position: Vector, velocity: Vector, id?: number) {
		this.position = position.clone();
		this.velocity = velocity.clone();

		this.id = id || SynchronUtility.getNextId();
	}

	public static buildFromObject(object: Unit): Unit {
		var position = Vector.buildFromObject(object.position);
		var velocity = Vector.buildFromObject(object.velocity);
		var result = new Unit(position, velocity, object.id);
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

	public collisionWithUnit(other: Unit): boolean {
		if (this.position.substract(other.position).getLength() < 20) {
			return true;
		} else {
			return false;
		}
	}
}

export default Unit;