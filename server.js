const path = require("path");
const http = require("http");
const express = require("express");
// const socketio = require("socket.io");
// const { Server } = require('socket.io');
// const cors = require('cors')
const { connect } = require('http2');
const bodyParser = require("body-parser");
const socketio = require('socket.io')


const app = express();
// app.use(cors());
const server = http.createServer(app);
// const io = socketio(server);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods:['GET', 'POST']
//   }
// });
const io = socketio(server);


const port = 3000

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

io.on('connection', (socket) => {
  // console.log('a user connected');
  
  //welcome current
  socket.emit('message','Welcome to the game');

  //Broadcasting for not to send
  socket.broadcast.emit('message','A user has joined the chat');

  socket.on('disconnect', () => {
    io.emit('message','A user has left the chat');
  });

  //Listening from the chatmessage
  socket.on('chatMessage',msg=>{
    io.emit('message',msg);
  })
});


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Room data storage
var rooms = {};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/', (req, res) => {
  //Handle Create room
  
  if(req.body.roomID){
    const { username, roomID } = req.body;
    // Check if the room exists
    if (rooms[roomID]) {
        // Add the user to the room
        rooms[roomID].users.push(username);

        // Redirect to the second page with the room code
        res.sendFile(path.join(__dirname, 'public', 'index2.html'));
    } else {
        res.send('Room not found');
    }
  }
  else{
    const { username } = req.body;
    
    // Generate a random room code (for simplicity, you might want to use a more secure method)
    const roomCode = generateRoomCode();
    console.log(username);

    // Store room data
    rooms[roomCode] = {
        users: [username],
    };
    console.log(username);

    // Redirect to the second page with the room code in query parameters
    res.sendFile(path.join(__dirname, 'public', 'index2.html'));
  }
    


});


function generateRoomCode() {
    var ans = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log(ans);
    return ans;
}