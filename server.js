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
let currentSize = 5; 

const port = process.env.PORT || 3000;


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

let roundGuesses = {}
let crnt = 0


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
    // console.log(user.roomID,getRoomUsers(user.roomID));

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
      currentSize = data.size || currentSize ;
      io.to(user.roomID).emit('onDraw', { x: data.x, y: data.y ,color: data.color,size : data.size });
    }
  });
 
   //Disconnecting Moves
   socket.on('down',(data)=>{
    const user = getCurrentUser(socket.id);
    if (user) {
      io.to(user.roomID).emit('onDown', { x: data.x, y: data.y, color : data.color , size: data.size});
    }
   });


   socket.on('up',(data)=>{
    const user = getCurrentUser(socket.id);
    if (user) {
      io.to(user.roomID).emit('onUp', { x: data.x, y: data.y, color : data.color,size : data.size });
    }
   })

   
  // Listening for chat messages
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);
    // var msg_display = false;
    const crctMsg = formatMessage(botName,`${user.username} has guessed correctly.`);
    const normalMsg = formatMessage(user.username,msg);
    // console.log(crctMsg);
    io.to(user.roomID).emit('message_checking',{msg,crctMsg,normalMsg,id : user.id});
    // io.to(user.roomID).emit('message', formatMessage(user.username, msg));
  });

  socket.on('increase_points',(id)=>{
    
    if(socket.id===id){
    const user = getCurrentUser(id);
    // console.log(`current user wala id dekhte hein : ${user}`);
    // console.log(`crnt : ${crnt}`);
    let size = getRoomUsers(user.roomID).length;

    // console.log(`increase_point wala fxn : ${getRoomUsers(user.roomID).length}`);
    const point = 10*(getRoomUsers(user.roomID).length - (crnt)%size);

    user.points += point;
    crnt++;

    // console.log(`${user.username} ke points : ${user.points}`);
    }
  })

  socket.on('disconnect', () => {
    const user = userLeaves(socket.id);
    // console.log('showing on disconnecting')
    if(user){
      io.to(user.roomID).emit('message', formatMessage(botName, `${user.username} has left the chat` ));
    }

    //send users and rooms info
    // console.log('hi')
   

    if(user){
      // console.log(user.roomID,getRoomUsers(user.roomID));
      io.to(user.roomID).emit('roomUsers',{
        room: user.roomID,
        users: getRoomUsers(user.roomID)
      });
      
    }  
  });

  socket.on('startGame', () => {
    currentRound = 0;
    const user = getCurrentUser(socket.id);
    // console.log(`startGame pe chal raha kya : ${user}`)
    // console.log(user)
    const user_list = getRoomUsers(user.roomID);
    startRound(user_list);
});

function startRound(user_list) {
  // const user = getCurrentUser(socket.id);
  // console.log(user);
   roundGuesses[currentRound] = [];
    currentRound++;
    console.log("Starting Round", currentRound);
    if (currentRound <= totalRounds) {
      //  crnt = 0;
        
        // io.to(user.roomID).emit('Overlaying',(5));
        // setTimeout(() => {
          Rounds(user_list);
        //   io.to(user.roomID).emit('HideOverlay',(5));
        //     // startRound(user_list); 
        // }, 5000);
    } else {
        console.log("Game ended");
        const user = getCurrentUser(socket.id);
        console.log(user.roomID,getRoomUsers(user.roomID));
        let userList = user_list;

        

        userList.sort((a,b)=>b.points-a.points);
        io.to(user.roomID).emit('FinalRank',(user_list));
        console.log('User List sorted \n');
        console.log(userList);
        // Handle game end logic
        currentRound =0;
    }
}

var right_word;

function Rounds(user_list) {
    let counter = 0;
    // crnt = 0;
    for (let i = 0; i < user_list.length; i++) {
        let user = user_list[i];
        
        // console.log(`crnt 0 hua kya : ${crnt}`);
      

        setTimeout(() => {
            io.to(user.roomID).emit('startTimer', 30);
            io.to(user_list[i].roomID).emit('startRound',currentRound);
             
            const word = randomWordSlugs.generateSlug(1,{format : "title"});
            io.to(user.roomID).emit('checker',{word,id : user.id});
            
            // console.log(word);
            // console.log("Current user id : ",user.id);
            io.to(user.id).emit('checkEmit',currentRound);
            io.to(user.id).emit('canDraw',true);
            io.to(user.id).emit('wordToDraw', word);

            const wordLength = word.length;
            user_list.filter(u => u.id !== user.id).forEach(otherUser => {
              io.to(otherUser.id).emit('cantDraw',(false));
              io.to(otherUser.id).emit('wordLength', wordLength);
          });
            // socket.broadcast.to(user.roomID).emit('wordLength', wordLength);
            crnt = 0;
            // console.log(`crnt 0 hua kya : ${crnt}`);
            console.log(user, "Turn ", (i + 1), " of Round ", currentRound);
            
           
            setTimeout(() => {
                counter++; 
                if (counter === user_list.length && currentRound!=4) {

                   io.to(user.roomID).emit('EndDetails',({user_list,currentRound}));
                   console.log('Got here at End Details');
                    setTimeout(() => {
                      // io.to(user.roomID).emit('HideOverlay',(5));
                      io.to(user.roomID).emit('HideEndDetails',(user.roomID));
                        startRound(user_list); 
                    }, 6000); 
                }
                else if(counter !== user_list.length){
                  io.to(user.roomID).emit('Overlaying',(user_list[i+1].username));
                setTimeout(()=>{
                  io.to(user.roomID).emit('HideOverlay',(5)); 
                },6000);
                }
            }, 30000); 
        }, i*36000);
         
        // console.log(`${user.username} has waited ${i*10000}`);
    }
}
});



app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function generateRoomCode() {
  var ans = Math.random().toString(36).substring(2, 8).toUpperCase();
  // console.log(ans);
  return ans;
}
