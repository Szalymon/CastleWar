"use strict";

var sio = require('socket.io');
var express = require('express');
var http = require('http');


var app = express();
var httpServer = http.createServer(app);
var io = sio(httpServer);

httpServer.listen(3000, function () {
    console.log("App server has been staterted.");
});


app.use('/game', express.static('dist/public'));
app.use('/assets', express.static('dist/public/assets'));
app.use(express.static('public'));


// Load balancing
let GameManager = require('./dist/private/server/server-manager');
let ConnectionManager = require('./dist/private/server/connection-handler');

let Model = require('./dist/private/common/model');
Model.Utils.initialize();


let connectionCounter = 0;
let gameManager = new GameManager.ServerGameManager();

var castle1;
var castle2;
var castle3;
var castle4;

io.sockets.on('connection', function (socket) {
    socket.on('disconnect', function() {
        gameManager.end();
    });

    connectionCounter++;
    if (connectionCounter % 2 === 0) {
        // Már létezik a játék
        var connectionManager = new ConnectionManager.ServerConnectionHandler(gameManager, "GAME");
        var player = new Model.Player();
        connectionManager.addClient(socket, player);
        gameManager.addObserver(connectionManager);
        castle3.setOwner(player);
        castle4.setOwner(player);

        gameManager.start();
    } else {
        // Most kell létrehozni
        gameManager = new GameManager.ServerGameManager();
        var connectionManager = new ConnectionManager.ServerConnectionHandler(gameManager, "GAME");

        var player = new Model.Player();
        connectionManager.addClient(socket, player);

        castle1 = new Model.Castle(25, 120, new Model.Vector(50, 50));
        castle2 = new Model.Castle(25, 120, new Model.Vector(50, 350));
        castle3 = new Model.Castle(25, 120, new Model.Vector(650, 50));
        castle4 = new Model.Castle(25, 120, new Model.Vector(650, 350));
        castle1.setOwner(player);
        castle2.setOwner(player);

        gameManager.addCastle(castle1);
        gameManager.addCastle(castle2);
        gameManager.addCastle(castle3);
        gameManager.addCastle(castle4);
        gameManager.addObserver(connectionManager);
    }
});