const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require('socket.io');
const formatMessage = require('./helpers/msgs');
const {userJoin , getCurrentUser , userLeaves , getRoomUsers} = require('./helpers/users');
const botName = 'Game Bot';
const randomWordSlugs = require('random-word-slugs');
// const randomWord = new RandomWordSlugs();

// import { generateSlug } from "random-word-slugs";
const app = express();
const server = http.createServer(app);
const io = socketio(server);
let currentColor = '#000000'; 

const port = 3000;


let connections = []

// Random word generator
// const randomWord = new RandomWordSlugs();


// Categories for random words
const categories = ['noun', 'animals', 'food'];

// Random word options
const options = {
  category: categories[Math.floor(Math.random() * categories.length)]
};


//IMPLEMENTING THE ROUND PART

let currentRound = 0;
const totalRounds = 3;



server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Room data storage
var rooms = {};
var entered = {};
io.on('connection', (socket) => {
  connections.push(socket);
  socket.on('joinRoom', ({username,roomID})=>{
    if(entered[username]){
      socket.emit('redirect','http://localhost:3000');
      entered[username] = false;
    }
    entered[username] = true;
    const user = userJoin(socket.id,username,roomID);

    const isHost = getRoomUsers(user.roomID).length === 1;

    socket.emit('hostStatus', isHost);

    socket.join(user.roomID);
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

  //Drawing 
  socket.on('draw', (data) => {
    // const user = userJoin(socket.id,username,roomID);
    const user = getCurrentUser(socket.id);
    if (user) {
      // console.log(data.color);
      currentColor = data.color || currentColor;
      io.to(user.roomID).emit('onDraw', { x: data.x, y: data.y ,color: data.color });
    }
  });
 
   //Disconnecting Moves
   socket.on('down',(data)=>{
    const user = getCurrentUser(socket.id);
    if (user) {
      io.to(user.roomID).emit('onDown', { x: data.x, y: data.y, color : data.color });
    }
   });

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

  socket.on('startGame', () => {
    // const user = getCurrentUser(socket.id);
    startRound();
  });

  function startRound() {
    const user = getCurrentUser(socket.id);
    currentRound++;
    if (currentRound <= totalRounds) {
      
      io.to(user.roomID).emit('startRound', currentRound);
      const word = randomWordSlugs.generateSlug(1,{format : "title"});
      
        // Logic to send the randomly generated word to the drawing player
        console.log(word);
        io.to(socket.id).emit('wordToDraw', word);

        // Logic to send the word length to all other players
        const wordLength = word.length;
        socket.broadcast.to(user.roomID).emit('wordLength', wordLength);
    
    } else {
      // If all rounds are completed, emit a signal to end the game
      io.to(user.roomID).emit('gameOver');
    }
  }
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
