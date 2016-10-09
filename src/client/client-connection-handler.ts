 /// <reference path="../../typings/globals/socket.io-client/index.d.ts"/>

import Model = require("../common/model");
import Manager = require("../common/manager");
import Observer = require("../common/observer");
import Controller = require("../common/controller");

export class ClientConnectionHandler implements Manager.Controllable {
	socket:SocketIOClient.Socket;
	static gameManager : Observer.Observer;
	
	constructor(socket:SocketIOClient.Socket) {
		this.socket = socket;
		
		socket.on("LOADCASTLES", function(castles:Model.CastleDictionary) {
			for(var castleId in castles) {
				castles[castleId] = Model.Castle.buildFromObject(castles[castleId]);
			}
			ClientConnectionHandler.gameManager.loadCastles(castles);
		});
		
		socket.on("LOADUNITLINES", function(unitLines:Model.UnitLineDictionary) {
			for(var unitLineId in unitLines) {
				unitLines[unitLineId] = Model.UnitLine.buildFromObject(unitLines[unitLineId]);
			}
			ClientConnectionHandler.gameManager.loadUnitLines(unitLines);
		});
		
		socket.on("UNITDIED", function(unitId : number[]) {
			ClientConnectionHandler.gameManager.unitRemoved(unitId);
		});
	}

	notifyObservers(unitRemoved: number[]) {

	}

	sendUnits(player : Model.Player,from:number, to:number) {
		this.socket.emit("SENDUNITS", {"from": from, "to": to});
	}
	
	cutLines(player : Model.Player, dict : Model.VectorDictionary) {
		this.socket.emit("LINESCUTTED", player, dict);
	}
	
	ready(player : Model.Player) {
		this.socket.emit("ready");
	}
}