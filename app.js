

var sio = require('socket.io');
var express = require('express');
var http = require('http');


var app = express();
var httpServer = http.createServer(app);
var io = sio(httpServer);

httpServer.listen(3000, function () {
    console.log("App server has been staterted.");
})


app.use('/game', express.static('dist/public'));
app.use('/assets', express.static('dist/public/assets'));
app.use(express.static('public'));
