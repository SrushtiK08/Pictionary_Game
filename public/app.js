const port = 3000;
const msgform = document.getElementById('msg-form');
const chtMessages = document.querySelector('.msgBox');
const socket = io();

// Getting username and room from URL
var { username, roomID } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

console.log(username,roomID);

// Join the room or create a new one
if (roomID === undefined) {
  // If no room is provided, generate a random room code
  roomID = generateRoomCode();
  console.log(username, roomID);
//   socket.emit('joinRoom',{username,roomID});

} else {
  console.log(username, roomID); 
}
socket.emit('joinRoom', { username,roomID });


//getting room and users
socket.on('roomUsers', ({roomID,user})=>{
    outputRoomName(roomID);
    outputUser(user);
})

// Message from Server
socket.on('message', (message) => {
  console.log(message);
  // Function for outing the message in the message box
  outputMessage(message);

  // Automated scrolling of the message tab
  chtMessages.scrollTop = chtMessages.scrollHeight;
});

// Message when submitted
msgform.addEventListener('submit', (e) => {
  e.preventDefault();

  // Fetching the message here
  const msg = e.target.elements.messageInput.value;

  // Emitting my message to the server
  socket.emit('chatMessage', msg);

  // Clearing out the input box
  e.target.elements.messageInput.value = '';
  e.target.elements.messageInput.focus();
});

// Output Message to Box
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('msgInputs');
  div.innerHTML = `<p class="meta"> ${message.username} <span>${message.time}</span> </p>
    <p class="text"> ${message.text}</p>`;

  document.querySelector('.msgBox').appendChild(div);
}

function generateRoomCode() {
  var ans = Math.random().toString(36).substring(2, 8).toUpperCase();
  console.log(ans);
  return ans;
}


//Add room name to Dom
function outputRoomName(room){
    
}