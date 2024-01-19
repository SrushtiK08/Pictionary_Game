const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Room data storage (in-memory for simplicity, you might want to use a database)
var rooms = {};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/create-room', (req, res) => {
    const { username } = req.body;

    // Generate a random room code (for simplicity, you might want to use a more secure method)
    const roomCode = generateRoomCode();

    // Store room data
    rooms[roomCode] = {
      
        users: [username],
    };
    console.log(username);

    // Redirect to the second page with the room code
    // res.redirect(`/index2?roomCode=${roomCode}&username=${username}`);
    res.sendFile(path.join(__dirname, 'public', 'index2.html'));

});

app.post('/join-room', (req, res) => {
    const { username, roomID } = req.body;
    console.log(username,roomID);
    console.log(rooms[roomID]);
    // Check if the room exists
    if (rooms[roomID]) {
        // Add the user to the room
        
        rooms[roomID].users.push(username);

        // Redirect to the second page with the room code
        // res.redirect(`/index2?roomCode=${roomCode}&username=${username}`);
        res.sendFile(path.join(__dirname, 'public', 'index2.html'));
    } else {
        // Room not found, handle accordingly (you might want to display an error)
        res.send('Room not found');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index2.html'));
});

function generateRoomCode() {
    var ans = Math.random().toString(36).substring(2, 8).toUpperCase()
    console.log(ans);
    return ans;
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
