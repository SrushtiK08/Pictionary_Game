const path = require("path");
const http = require("http");
const express = require("express");
// const socketio = require("socket.io");
const { Server } = require('socket.io');
const cors = require('cors')
const { connect } = require('http2');
const bodyParser = require("body-parser");


const app = express();
app.use(cors());
const server = http.createServer(app);
// const io = socketio(server);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods:['GET', 'POST']
  }
});
const port = 8000

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

io.on('connection',(socket) =>{
console.log('New WS Connected');

// socket.on('connection',() => {
//   console.log(`User connected ${socket.id}`)
// })



});


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json());

// Room data storage
var rooms = {};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/', (req, res) => {
  //Handle Create room
  
  if(req.body.roomID){
    const { username, roomID } = req.body;
    console.log(username, roomID);
    console.log(rooms[roomID]);
    // Check if the room exists
    if (rooms[roomID]) {
        // Add the user to the room
        rooms[roomID].users.push(username);

        // Redirect to the second page with the room code in query parameters
        // res.redirect(`/index2?roomCode=${roomID}&username=${username}`);
        res.sendFile(path.join(__dirname, 'public', 'index2.html'));
    } else {
        // Room not found, handle accordingly (you might want to display an error)
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

// app.post('/', (req, res) => {
//     const { username, roomID } = req.body;
//     console.log(username, roomID);
//     console.log(rooms[roomID]);
//     // Check if the room exists
//     if (rooms[roomID]) {
//         // Add the user to the room
//         rooms[roomID].users.push(username);

//         // Redirect to the second page with the room code in query parameters
//         // res.redirect(`/index2?roomCode=${roomID}&username=${username}`);
//         res.sendFile(path.join(__dirname, 'public', 'index2.html'));
//     } else {
//         // Room not found, handle accordingly (you might want to display an error)
//         res.send('Room not found');
//     }
// });


function generateRoomCode() {
    var ans = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log(ans);
    return ans;
}