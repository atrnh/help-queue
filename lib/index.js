'use strict';

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cookie = require('cookie-session');

var QUEUE = {
  students: [],
  help: function help(name) {
    this.students.push(name);
  },
  dequeue: function dequeue(name) {
    this.students.shift();
  },
  toString: function toString() {
    return 'Queue = [ ' + this.students.join(', ') + ' ]';
  }
};

app.get('/', function (req, res) {
  res.sendFile('/Users/atrinh/help-queue/index.html');
});

io.on('connection', function (socket) {
  console.log('[SERVER] A user connected');

  socket.on('disconnect', function () {
    console.log('[SERVER] A user disconnected');
  });

  socket.on('chat message', function (msg) {
    io.emit('chat message', msg);
    console.log('[MSG] ' + msg);

    var nickname = /(\w+)(?:\: .*)/.exec(msg)[1];
    var cmd = /(?:\:)(\w+)(?:\:)/.exec(msg);

    if (cmd) {
      try {
        QUEUE[cmd[1]](nickname);
        console.log('[CMD] ' + cmd[1]);
        io.emit('queue updated', QUEUE.toString());
      } catch (e) {
        if (e instanceof TypeError) {
          io.emit('chat message', '\'' + cmd + '\' is not a valid command. Try again.');
        }
      }
    }
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});