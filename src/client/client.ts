/// <reference path="../../typings/globals/socket.io-client/index.d.ts"/>
/// <reference path="../../typings/globals/phaser/index.d.ts"/>

var socket = io();

import Model = require("../common/model");
import Manager = require("./client-manager");
import Presenter = require("./presenter");
import ConnectionHandler = require("./client-connection-handler");

var clientGameManager:Manager.ClientGameManager;
var clienConnectionHandler:ConnectionHandler.ClientConnectionHandler;
var game:Presenter.Presenter;

socket.on("you are in", function(playerId) {

	console.log("I am in.");
	Model.Utils.initialize();
	game = new Presenter.Presenter();
	clientGameManager = new Manager.ClientGameManager();
	
	clientGameManager.ownPlayerId = playerId;
	ConnectionHandler.ClientConnectionHandler.gameManager = clientGameManager;
	clienConnectionHandler = new ConnectionHandler.ClientConnectionHandler(socket);
	clientGameManager.controlable = clienConnectionHandler;
	
	game.state.add("INGAME", Presenter.Match, false);
	game.gameManager = clientGameManager;
	game.controllable = clienConnectionHandler;
	game.state.start("INGAME");
	socket.emit("ready");
});

socket.on("disconnect", function() {
	game.destroy();
});

//-----------------------------------------
// Initialize phaser
//-----------------------------------------
/*
game = new Presenter.Presenter();
game.state.add("INGAME", Presenter.Match, false);
game.gameManager = clientGameManager;
game.state.start("INGAME");
*/