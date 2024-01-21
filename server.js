const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require('socket.io');
const formatMessage = require('./helpers/msgs');
const {userJoin , getCurrentUser , userLeaves , getRoomUsers} = require('./helpers/users');
const botName = 'Game Bot';

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = 3000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Room data storage
var rooms = {};

io.on('connection', (socket) => {

  socket.on('joinRoom', ({username,roomID})=>{
    const user = userJoin(socket.id,username,roomID);
    socket.join(user.roomID);
    // Welcome current user
    // console.log(roomID,username);
    // console.log(user.roomID,getRoomUsers(user.roomID));
  socket.emit('message', formatMessage(botName, 'Welcome to the game'));

  // Broadcasting for others not to send
  socket.broadcast.to(user.roomID).emit('message', formatMessage(botName, `${user.username} has joined the room`));

  //send users and rooms info
  if(user){
    console.log(user.roomID,getRoomUsers(user.roomID));
  io.to(user.roomID).emit('roomUsers',{
    room: user.roomID,
    users: getRoomUsers(user.roomID)
  });
  }

  });

  console.log('a user connected');

  

 

  // Listening for chat messages
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.roomID).emit('message', formatMessage(user.username, msg));
  });

  socket.on('disconnect', () => {
    const user = userLeaves(socket.id);
    // console.log('showing on disconnecting')

    if(user){
      io.to(user.roomID).emit('message', formatMessage(botName, `${user.username} has left the chat` ));
    }

    //send users and rooms info
    // console.log('hi')
    if(user){
      console.log(user.roomID,getRoomUsers(user.roomID));
      io.to(user.roomID).emit('roomUsers',{
        room: user.roomID,
        users: getRoomUsers(user.roomID)
      });
    }   
  });
  
});

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function generateRoomCode() {
  var ans = Math.random().toString(36).substring(2, 8).toUpperCase();
  console.log(ans);
  return ans;
}
