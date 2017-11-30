var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');
var amqp = require('amqplib/callback_api');

var rclient = redis.createClient(); // will use 127.0.0.1 and 6379

var amqpChannel = null;
var amqpExchange = 'exchange';

// Connect to RabbitMQ
amqp.connect('amqp://test:test@10.50.1.148', function(err, conn) {
    console.log("## Rabbit MQ connected ##");			
		conn.createChannel(function(err, ch) {
			amqpChannel = ch;
			amqpChannel.assertExchange(amqpExchange, 'fanout', {durable: true});						
		});
});

rclient.on('connect', function () {
    console.log('## Redis Connected ##');
});

// Test Mobile Client
app.get('/client', function (req, res) {
    res.sendFile(__dirname + '/public/client.html');
});

// Connect Socket IO
io.on('connection', function (socket) {
    console.log('## Socket User connected ## ' + socket.id);

    // On get User Info
    socket.on('userInfo', function (user) {
        console.log('> UserInfo Received = ' + user);
        // Store session user info into Redis cache
        console.log("> Storing Session ID = " + socket.id);
        storeUserInfoInCache(socket.id, user);
    });
	
	// On get Location Info
    socket.on('location', function (location) {
        console.log('Location Received = ' + location);
		sendLocationAmqp(location);
	});


    // Receive Location from mobile client
    socket.on('location', function (msg) {
        console.log('Location Received: ' + msg);
        // Broadcast to all the group members
        io.emit('location', "Broadcast location - " + msg);
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});


function storeUserInfoInCache(socketId, user) {
	var userObj = JSON.parse(user);	
	rclient.hmset('Socket', userObj, function (err, reply) {
		console.log("> Stored User data of Session ID = " + socketId + " ## " + reply);
	});

	rclient.hgetall('Socket', function (err, object) {
		console.log("> Get User data stored in cache = " + JSON.stringify(object));
	});
}

//Send location to RabbitMQ to be saved into database
function sendLocationAmqp(location) {
	console.log("> sending AMQP");
	amqpChannel.publish(amqpExchange, '', new Buffer(location));
	console.log("> Sent to AMQP", location);
}

