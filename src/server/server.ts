/// <reference path="../../typings/globals/socket.io/index.d.ts" />
/// <reference path="../../typings/modules/express/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />

import Model = require("../common/model");
import GameManager = require("./server-manager");
import ConnectionManager = require("./connection-handler");

import sio = require("socket.io");
import express = require('express');
import http = require("http");


Model.Utils.initialize();

var app = express();
var appServer = app.listen(3000);
var io = sio.listen(appServer);
/*
httpServer.listen(3000, function() {
    console.log("Server has been started and listening on port 3000");
});
*/
//var httpServer = http.createServer(appServer);
//var io = sio.listen(httpServer);

var caslte1 : Model.Castle;
var caslte2 : Model.Castle;
var caslte3 : Model.Castle;
var caslte4 : Model.Castle;

var connectionCounter = 0;
var gameManager : GameManager.ServerGameManager;
io.sockets.on('connection', function (socket : SocketIO.Socket) {
	socket.on('disconnect', function() {
		gameManager.end();
	});
	connectionCounter++;
	if(connectionCounter % 2 == 0) {
		// Már létezik a játék
		var connectionManager = new ConnectionManager.ServerConnectionHandler(gameManager,"GAME");
		var player = new Model.Player();
		connectionManager.addClient(socket, player);
		gameManager.addObserver(connectionManager);
		caslte3.setOwner(player);
		caslte4.setOwner(player);
		
		gameManager.start();
	} else {
		// Most kell létrehozni
		gameManager = new GameManager.ServerGameManager();
		var connectionManager = new ConnectionManager.ServerConnectionHandler(gameManager,"GAME");
		
		var player = new Model.Player();
		connectionManager.addClient(socket, player);
		
		caslte1 = new Model.Castle(25,120,new Model.Vector(50,50));
		caslte2 = new Model.Castle(25,120,new Model.Vector(50,350)); 
		caslte3 = new Model.Castle(25,120,new Model.Vector(650,50)); 
		caslte4 = new Model.Castle(25,120,new Model.Vector(650,350));
		caslte1.setOwner(player);
		caslte2.setOwner(player);
		
		gameManager.addCastle(caslte1);
		gameManager.addCastle(caslte2);
		gameManager.addCastle(caslte3);
		gameManager.addCastle(caslte4);
		gameManager.addObserver(connectionManager);
	}
});

//-----------------------------------------
// App server code for testing
//-----------------------------------------

var rootDir = __dirname + "/client_data/";
var clientDir = __dirname + "/client_data/client";
var commonDir = __dirname + "/client_data/common";
var assetsDir = __dirname + "/client_data/assets/";
var libsDir = __dirname + "/client_data/libs/";

//-----------------------------------------
// Base code of the client
//-----------------------------------------

app.get('/', function(req, res) {
	res.sendFile('index.html', { root: rootDir });
});

app.get('/client.js', function(req, res){
  res.sendFile('client.js', { root:  clientDir });
});
app.get('/client-connection-handler.js', function(req, res){
  res.sendFile('client-connection-handler.js', { root: clientDir });
});
app.get('/presenter.js', function(req, res) {
    res.sendFile('presenter.js', { root: clientDir });
});
app.get('/client-manager.js', function(req, res) {
    res.sendFile('client-manager.js', { root: clientDir });
});
app.get('/common/model.js', function(req, res) {
    res.sendFile('model.js', { root: commonDir });
});
app.get('/common/manager.js', function(req, res) {
    res.sendFile('manager.js', { root: commonDir });
});

//-----------------------------------------
// Assets
//-----------------------------------------


app.get('/assets/tribal_war.mp3', function(req, res) {
  res.sendFile('tribal_war.mp3', { root: assetsDir });
});
app.get('/assets/castle.png', function(req, res) {
  res.sendFile('castle.png', { root: assetsDir });
});
app.get('/assets/grass.png', function(req, res) {
  res.sendFile('grass.png', { root: assetsDir });
});
app.get('/assets/cutter.png', function(req, res){
  res.sendFile('cutter.png', { root: assetsDir });
});
app.get('/assets/castle_enemy.png', function(req, res){
  res.sendFile('castle_enemy.png', { root: assetsDir });
});
app.get('/assets/arrow.png', function(req, res){
  res.sendFile('arrow.png', { root: assetsDir });
});
app.get('/assets/unit.png', function(req, res){
  res.sendFile('unit.png', { root: assetsDir });
});

//-----------------------------------------
// Imported libraries
//-----------------------------------------
app.get('/require.js', function(req, res) {
    res.sendFile('require.js', { root: libsDir });
});
app.get('/socket.io.js', function(req, res) {
    res.sendFile('socket.io.js', { root: libsDir });
});
app.get('/phaser.min.js', function(req, res) {
    res.sendFile('phaser.min.js', { root: libsDir });
});
app.get('/phaser.js', function(req, res) {
    res.sendFile('phaser.js', { root: libsDir });
});
app.get('/phaser.map', function(req, res) {
    res.sendFile('phaser.map', { root: libsDir });
});


