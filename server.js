var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');

var rclient = redis.createClient(); // will use 127.0.0.1 and 6379

rclient.on('connect', function() {
    console.log('Redis connected');	
});

// Test Mobile Client
app.get('/client', function(req, res){
  res.sendFile(__dirname + '/public/client.html');
});

// Connect Socket IO
io.on('connection', function(socket){
  console.log('a user connected');
  
  // On get User Info
  socket.on('userInfo', function(user){
	console.log('UserInfo Received = ' + user);
	// Store session user info into Redis cache
	console.log("Storing Session ID = " + socket.id);
	var userObj = {'dd':'ee'};
	rclient.hmset('Socket:' + socket.id, {'dd':'ee'}, function(err, reply) {
		console.log("Stored data of Session ID = " + socket.id + " ## " + reply);
	});	
	
	rclient.hgetall('Socket:' + socket.id, function(err, object) {
		console.log("Socket stored in cache = " + JSON.stringify(object));
	});
	
  });
  
  
  
  
  
  
  
  // Receive Location from mobile client
  socket.on('location', function(msg){
	console.log('Location Received: ' + msg);
	// Broadcast to all the group members
	io.emit('location', "Broadcast location - " + msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});