
const port = 3001;

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    var dis = 0;
    document.getElementById('game').style.display = 'none';
    // Add or modify JavaScript code for managing the game layout

    function createRoom() {
        const usernameInput = document.getElementById('username');
        const username = usernameInput.value.trim();

        if (username !== '') {
            // Store the username for creating a room
            // You can use this username when sending data to the server
            // For now, let's just log it to the console
            console.log('Username for creating room:', username);

            // Update the UI to show the game section
            document.getElementById('lobby').style.display = 'none';
            document.getElementById('game').style.display = 'block';
        } else {
            alert('Please enter a valid username.');
        }
    }

    function joinRoom() {
        const usernameInput = document.getElementById('username2');
        const roomIDInput = document.getElementById('roomID');

        const username = usernameInput.value.trim();
        const roomID = roomIDInput.value.trim();

        if (username !== '' && roomID !== '') {
            // Store the username and room ID for joining a room
            // You can use these values when sending data to the server
            // For now, let's just log them to the console
            console.log('Username for joining room:', username);
            console.log('Room ID:', roomID);

            // Update the UI to show the game section
            document.getElementById('lobby').style.display = 'none';
            document.getElementById('game').style.display = 'block';
        } else {
            alert('Please enter a valid username and room ID.');
        }
    }

    function goBack(){
        document.getElementById('lobby').style.display='block';
        document.getElementById('game').style.display='none';
    }

    // Add event listeners to your buttons
    document.getElementById('createroom').addEventListener('click', createRoom);
    document.getElementById('joinroom').addEventListener('click', joinRoom);
    // document.getElementById('goBack').addEventListener('click', goBack);
});




