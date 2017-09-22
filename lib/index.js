'use strict';

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cookie = require('cookie-session');

var QUEUE = [];
var COMMANDS = {
  shift: function shift(n) {
    QUEUE.shift();
  },
  help: function help(n) {
    QUEUE.push(n);
  }
};

app.get('/', function (req, res) {
  res.sendFile('/Users/atrinh/help-queue/index.html');
});

io.on('connection', function (socket) {
  console.log('a user connected');

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });

  socket.on('chat message', function (msg) {
    io.emit('chat message', msg);
    console.log('[MSG] ' + msg);

    var nickname = /(\w+)(?:\: .*)/.exec(msg)[1];
    console.log(nickname);
    var cmd = /(?:\:)(\w+)(?:\:)/.exec(msg);
    console.log(cmd);

    if (cmd) {
      try {
        COMMANDS[cmd[1]](nickname);
        console.log('[CMD] ' + cmd[1]);
        io.emit('queue updated', 'Queue = [ ' + QUEUE.join(', ') + ' ]');
      } catch (e) {
        if (e instanceof TypeError) {
          io.emit('chat message', 'Invalid command.');
        }
      }
    }
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});