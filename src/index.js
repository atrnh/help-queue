let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let cookie = require('cookie-session');

const QUEUE = [];
const COMMANDS = {
  dequeue(n) { QUEUE.shift(); },
  help(n) { QUEUE.push(n); },
};

app.get('/', (req, res) => {
    res.sendFile('/Users/atrinh/help-queue/index.html');
});

io.on('connection', socket => {
  console.log('[SERVER] A user connected');

  socket.on('disconnect', () => {
    console.log('[SERVER] A user disconnected');
  });

  socket.on('chat message', msg => {
    io.emit('chat message', msg);
    console.log(`[MSG] ${msg}`);

    const nickname = /(\w+)(?:\: .*)/.exec(msg)[1];
    const cmd = /(?:\:)(\w+)(?:\:)/.exec(msg);

    if (cmd) {
      try {
        COMMANDS[cmd[1]](nickname);
        console.log(`[CMD] ${cmd[1]}`);
        io.emit('queue updated', `Queue = [ ${QUEUE.join(', ')} ]`);
      } catch (e) {
        if (e instanceof TypeError) {
          io.emit('chat message', `'${cmd}' is not a valid command. Try again.`);
        }
      }
    }
  });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
