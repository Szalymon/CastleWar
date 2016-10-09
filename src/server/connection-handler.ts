/**
 * Feladata a kliens authentikációja, az onnan érkező kérések kezelése
 */

import sio = require("socket.io");

import ServerManager = require("./server-manager");
import Model = require("../common/model");
import Controller = require("../common/controller");
import Observer = require("../common/observer");
import Manager = require("../common/manager");

export class ServerConnectionHandler implements Observer.Observer, Controller.Controller {
	// TODO Ide lehet, hogy inkább a game controllerek kellenének, és akkor mindennek csak egy
	// ConnectionManagere lenne
	// DE ez nem olyan szép minden minden konneckcióhoz külön manager,
	// plusz egy static-us socket feoldás
	//private static gameManagerOfSocketId : ServerGameManagerDictionary = {};
	//private static socketIdOfPlayer = {};
	//private static playerOfSocketId : Model.PlayerDictionary = {};
	//private static socketById:SocketDictionary = {};
	
	//private static socketHandler : ServerConnectionHandlerDictionary = {};
	
	controlable:Manager.Controllable;
	private playerName : string;
	private player : Model.Player;
	private roomName : string;
	private socketToClient : SocketIO.Socket;

	constructor(gameManager : ServerManager.ServerGameManager, roomName : string) {
		this.controlable = gameManager;
		this.roomName = roomName;
	}
	/*
	private getSocket() : SocketIO.Socket {
		var sid:string = ServerConnectionHandler.socketIdOfPlayer[this.playerName];
		return ServerConnectionHandler.socketById[sid];
	}
	*/
	//-----------------------------------------
	// Observer (implementation)
	//-----------------------------------------
	public loadCastles(castles : Model.CastleDictionary) {
		//this.getSocket().emit("LOADCASTLES", castles);
		this.socketToClient.emit("LOADCASTLES", castles);
	}
	
	public loadUnitLines(unitLines : Model.UnitLineDictionary) {
		this.socketToClient.emit("LOADUNITLINES", unitLines);
	}
	
	unitRemoved(unitId : number[]) {
		this.socketToClient.emit("UNITDIED", unitId);
	}
	
	public gameHasStarted() {
		this.socketToClient.emit("GAMEHASSTARTED");
	}
	public gameHasEnded() {
		
	}
	//-----------------------------------------
	
	public addClient(socket : SocketIO.Socket, newPlayer : Model.Player) {
		//ServerConnectionHandler.gameManagerOfSocketId[socket.id] = this.controlable;
		this.socketToClient = socket;

		//ServerConnectionHandler.socketById[socket.id] = socket;
		
		//ServerConnectionHandler.socketHandler[socket.id] = this;

		// TODO játékos létrehozása felelősége a GameManagerhez majd inkább
		//var newPlayer:Model.Player = new Model.Player();
		this.player = newPlayer;
		this.playerName = newPlayer.name;
		console.log(this.playerName + " is connected.");
		(<ServerManager.ServerGameManager>this.controlable).addPlayer(newPlayer);
		//(<ServerManager.ServerGameManager>ServerConnectionHandler.gameManagerOfSocketId[socket.id]).addPlayer(newPlayer);
		//ServerConnectionHandler.socketIdOfPlayer[newPlayer.name] = socket.id;
		//ServerConnectionHandler.playerOfSocketId[socket.id] = newPlayer;

		var _this = this;
		socket.on("ready", function() {
			//var handler : ServerConnectionHandler = ServerConnectionHandler.socketHandler[socket.id];
			//handler.controlable.ready(handler.player);
			_this.controlable.ready(_this.player);
			//ServerConnectionHandler.gameManagerOfSocketId[socket.id].ready(ServerConnectionHandler.playerOfSocketId[socket.id]);
			
		});
		
		socket.on("SENDUNITS", function(data) {
			//var handler : ServerConnectionHandler;
			//handler = ServerConnectionHandler.socketHandler[socket.id];
			
			//handler.controlable.sendUnits(handler.player, data["from"], data["to"]);
			_this.controlable.sendUnits(_this.player, data["from"], data["to"]);
		});
		
		socket.on("LINESCUTTED", function(player, dict) {
			//var handler : ServerConnectionHandler;
			//handler = ServerConnectionHandler.socketHandler[socket.id];
			
			var cuttersDict : Model.VectorDictionary = {};
			for(var unitLineId in dict) {
				var p = Model.Vector.buildFromObject(dict[unitLineId]);
				cuttersDict[unitLineId] = p;
			}
			
			//handler.controlable.cutLines(handler.player, cuttersDict);
			_this.controlable.cutLines(_this.player, cuttersDict);
		});
		
		socket.on("disconnect", function() {
			//delete ServerConnectionHandler.socketHandler[socket.id];
			//delete ServerConnectionHandler.socketById[socket.id];
		});

		socket.emit("you are in", newPlayer.id);
	}
}

interface ServerConnectionHandlerDictionary {
	[index: string]: ServerConnectionHandler;
}

interface SocketDictionary {
	[index: string]: SocketIO.Socket;
}