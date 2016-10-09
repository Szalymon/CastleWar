import Model = require("../common/model");
import Manager = require("../common/manager");
import Observer = require("../common/observer");
import Controller = require("../common/controller");


export class ClientGameManager extends Manager.GameManager implements Observer.Observer, Manager.Controllable, Controller.Controller {
	controlable:Manager.Controllable;
	
	ownPlayerId : number;

	sendUnits(player : Model.Player,from:number, to:number) {
		this.controlable.sendUnits(player, from, to);
	}
	
	cutLines(player : Model.Player, dict : Model.VectorDictionary){
		console.log(dict);
		this.controlable.cutLines(null, dict);
	}
	
	ready(player : Model.Player){
		
	}
	
	unitRemoved(unitIds : number[]) {
		//console.log(Model.Utils.removedOnes);
		Model.Utils.removedOnes = Model.Utils.removedOnes.concat(unitIds);
		//console.log(Model.Utils.removedOnes);
	}
	
	loadCastles(castles:Model.CastleDictionary) {
		this.castles = castles;
	}
	
	loadUnitLines(unitLines : Model.UnitLineDictionary) {
		this.unitLines = unitLines;
	}

	notifyObservers(unitRemoved: number[]) {

	}
	
	gameHasStarted() {
		
	}
	gameHasEnded() {
		
	}
} 