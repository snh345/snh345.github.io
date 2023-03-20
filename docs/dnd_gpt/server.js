var fs = require('fs');

// Express is a node module for building HTTP servers
var express = require('express');
var app = express();

// Tell Express to look in the "public" folder for any files first
app.use(express.static('public'));

// If the user just goes to the "route" / then run this function
app.get('/', function (req, res) {
  res.send('Hello World!')
});

// Here is the actual HTTP server 
// In this case, HTTPS (secure) server
var https = require('https');

// Security options - key and certificate
var options = {
  key: fs.readFileSync('public/privkey1.pem'),
  cert: fs.readFileSync('public/cert1.pem')
};

// We pass in the Express object and the options object
var httpServer = https.createServer(options, app);

// Default HTTPS port
httpServer.listen(443);

// WebSocket Portion
// WebSockets work with the HTTP server
// Using Socket.io
const { Server } = require('socket.io');
const io = new Server(httpServer, {});

var messages = [
  {"role": "assistant", "content": "which option should they take? <br> <button>Investigate the mysterious sounds</button><button>Look for another path through the woods</button>"}
];
console.log(messages[0]['role']);

function updateChat(messages, role, content){
  messages.push({"role": role, "content": content});
  return messages; //needed?
}

// Send current time to all connected clients
function sendTime() {
    io.emit('time', { time: new Date().toJSON() });
}

// Send current time every 10 secs
setInterval(sendTime, 10000);

// Emit welcome message on connection
io.sockets.on('connection', function(socket) {
    // Use socket to communicate with this particular client only, sending it it's own id
    socket.emit('welcome', { message: 'Welcome to DnD GPT!', id: socket.id });

        socket.on('gpt-msg', (data)=> {
          let prompt = data.message;
          fetchStuff(prompt); 
    });

       socket.on('char-msg', (data)=> {
        updateChat(messages, "user", data.message);
    });

    socket.on('image', function (data) {
      io.emit('img', data);
    });

    socket.on('name', function (data) {
      users[socket.id].username = data;
      io.emit('character-name', data);
    });

    socket.on('backstory', function (data) {
      io.emit('character-backstory', data);
    });

      socket.on('begin-game', (data)=> {
        let prompt = data.message;
        fetchStuff(prompt);
    });
});

app.listen(5500);

function fetchStuff(prompt){
  updateChat(messages, "user", prompt);
  fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "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",
  },
  body: JSON.stringify({
    "model": "gpt-3.5-turbo",
    "messages": messages,
  }),

})
  .then((response) => response.json())
  .then((data) => {
    const answer = data.choices[0].message.content;
    updateChat(messages,"assistant",data.choices[0].message.content);
    console.log(answer);
    io.sockets.emit('gpt-response', {
      message: "\n" + answer})
  })
  .catch((error) => console.error(error));

} 
