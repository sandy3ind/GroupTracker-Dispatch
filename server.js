var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');

var client = redis.createClient(); // will use 127.0.0.1 and 6379

client.on('connect', function() {
    console.log('Redis connected');
});

// Test Client
app.get('/client', function(req, res){
  res.sendFile(__dirname + '/public/client.html');
});

// Connect Socket IO
io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});