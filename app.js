var app = require('express')();
var path = require('path');

var http = require('http').Server(app);
var io = require('socket.io')(http);
var argv = require("minimist")(process.argv.slice(2), { default: { show: 1 } });
var five = require("johnny-five");
var boardOne = new five.Board();
var express = require('express');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

boardOne.on("ready", function() {
	
  //LEDS

		var led = new five.Led(9);
		var led2 = new five.Led(10);
    io.on('connection', function(socket) {
        socket.on('message', function(msg) {
            io.emit('message', msg);
            if (msg == 0) {
	            	console.log(msg + " recieved");
                led.brightness(10);
                led2.brightness(10);
	          } else if (msg >= 1 && msg < 99) {
	                console.log(msg + " recieved");
	                led.brightness(100);
	                led2.brightness(100);
	          } else if (msg >= 100 && msg < 499) {
	                console.log(msg + " recieved");
	                led.brightness(150);
	                led2.brightness(150);
	          } else if (msg >= 500 && msg < 999) {
                	console.log(msg + " recieved");
	                led.brightness(200);
	                led2.brightness(200);
            } else if (msg >= 1000) {
                	console.log(msg + " recieved");
	                led.brightness(256);
	                led2.brightness(256);
            }

        });

    });
});


http.listen(3000, function() {
    console.log('listening on *:3000');
});


