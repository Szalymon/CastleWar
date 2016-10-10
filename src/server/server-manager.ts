/**
 * A szerver oldali esményeket kezeli, validálja a kliensről érkezőket, továbbítja
 */
 
import Model = require("../common/model");
import Controller = require("../common/controller");
import ConnectionHandler = require("./connection-handler");
import Manager = require("../common/manager");
import Observer = require("../common/observer");

export class ServerGameManager extends Manager.GameManager implements Manager.Controllable, Manager.Observerable {
	private static id:number = 0;
	private ownedId:number;
	observers : Observer.Observer[];

	playerReady : number = 0;
	PlayerNumberToStart : number = 2;
	
	//-----------------------------------------
	// Functions
	//-----------------------------------------
	
	constructor() {
		super();
		console.log("Server has been created");
		this.elapsedTime = Number.MIN_VALUE;
		this.observers = new Array();
		this.ownedId = ServerGameManager.getNextId();
	}
	
	public start() {
		console.log("GameStarted");
		this.timer = setInterval(() => {
			this.tick();
		}, 10);
		//this.timer = setInterval(ServerGameManager.tick, 10, this);
	}

    public end() {
        clearInterval(this.timer);
    }

	public addObserver( observer : Observer.Observer) {
		this.observers.push(observer);
	}
	
	public notifyObservers(unitRemoved : number[]) {
		for (var index = 0; index < this.observers.length; index++) {
	        var observer = this.observers[index];
			if(unitRemoved.length > 0) {
        		observer.unitRemoved(unitRemoved);
			}
			observer.loadUnitLines(this.unitLines);
			observer.loadCastles(this.castles);
		}
	}
	
	// Csinálhatnék egy tick-e amit inkább meghívok rajta
	tick() {
		super.tick();
		var unitRemoved = this.checkCollisions();
		this.notifyObservers(unitRemoved);
	}
	
	private static getNextId() : number {
		ServerGameManager.id++;
		return ServerGameManager.id;
	}
	
	private getId() : number {
		return this.ownedId;
	}
	
	public ready(player : Model.Player) {
		console.log("Player added");
		this.playerReady++;
		if(this.playerReady == this.PlayerNumberToStart) {
			console.log("start");
			this.start();
		}
	}
	
	sendUnits(player : Model.Player, from : number, to : number) {
		 // TODO le kell csekkolni a, hogy lehetséges-e
		 // Van-e? pl
		 if(player.id != this.castles[from].owner.id || to == from) {
		 	return;
		 }
		 
		 var castleFrom = this.castles[from];
		 var castleTo = this.castles[to];
		 var direction = castleTo.position.substract(castleFrom.position).getNormalized();
		 var unitLine = new Model.UnitLine(player, from, to, castleFrom.position, direction);
		 this.unitLines[unitLine.id] = unitLine;
//		 this.castles[from].unitLines[unitLine.id] = unitLine;
		 this.castles[from].unitLineIds.push(unitLine.id);
		 
	}
	
	cutLines(player : Model.Player, dict : Model.VectorDictionary) {
		for(var unitLineId in dict) {
			var p : Model.Vector = dict[unitLineId];
			var unitLine = this.unitLines[unitLineId];
			var cuttingIndex;
			if(unitLine.owner.id == player.id && !unitLine.isCutted) {
				// Vágni való pont megkeresése
				for (var index = unitLine.units.length - 1; index >= 0; index--) {
        			var unit = unitLine.units[index];
        			var dir = p.substract(unit.position);
        			var bool_x = dir.x * unitLine.direction.x >= 0;
        			var bool_y = dir.y * unitLine.direction.y >= 0;
        			if(!bool_x || !bool_y) {
        				cuttingIndex = index;
        				index = -1;
        			}
				}

                // Egy queue-be rakja, hogy ne sérüljön az adakonzisztencia
				var element = {};
				element["unitLineId"] = unitLineId;
				element["cuttingIndex"] = cuttingIndex;
				this.cuttingQueue.push(element);
			}
		}
	}

	registerObserver(ob : Observer.Observer){

	}
	requestSynchronization(){

	}
}
