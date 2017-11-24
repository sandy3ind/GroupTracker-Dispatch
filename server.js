
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Test Client
app.get('/client', function(req, res){
  res.sendFile(__dirname + '/public/client.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});