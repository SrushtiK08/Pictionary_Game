const port = 3000;
const msgform = document.getElementById('msg-form');
const chtMessages = document.querySelector('.msgBox');
const roomName = document.querySelector('.roomCode');
const userList = document.getElementById('joinedUsersList');
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
socket.on('roomUsers', ({room,users})=>{
    console.log(room,users);
    outputRoomName(room);
    outputUser(users);
})

// Message from Server
socket.on('message', (message) => {
  console.log(message);
  // Function for outing the message in the message box
  outputMessage(message);

  // Automated scrolling of the message tab
  chtMessages.scrollTop = chtMessages.scrollHeight;
});


  socket.on('redirect', (url) => {
    window.location.href = url;
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
  div.classList.add('msgs');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
//   p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.msgBox').appendChild(div);
//   const div = document.createElement('div');
//   div.classList.add('msgInputs');
//   div.innerHTML = `<p class="meta"> ${message.username} <span>${message.time}</span> </p>
//     <p class="text"> ${message.text}</p>`;

//   document.querySelector('.msgBox').appendChild(div);
}

function generateRoomCode() {
  var ans = Math.random().toString(36).substring(2, 8).toUpperCase();
  console.log(ans);
  return ans;
}


//Add room name to Dom
function outputRoomName(roomID){
    // roomName.innerText = roomID;
    const div = document.createElement('div');
    div.classList.add('roomCode');
    div.innerHTML = `<h3>Your Room Code:</h3>
    <p class="roomCodeValue">${roomID}</p>`;
  
    document.querySelector('.roomCode').innerHTML = div.innerHTML;
}


//Add users to DOM
function outputUser(users){
    userList.innerHTML = '';
    users.forEach((user) => {
        const li = document.createElement('li');

        // Create a new <i> element with a Font Awesome icon
        // const iconElement = document.createElement('i');
        // iconElement.classList.add('fas', 'fa fa-user-circle-o'); 
        // li.appendChild(iconElement);

        // Set the username as text content of the <li>
        li.appendChild(document.createTextNode(` ${user.username}`));

        // Append the <li> to the user list
        userList.appendChild(li);
      });
}




//CANVAS PART

const canvas = document.getElementById("drawingCanvas");
// let test = document.getElementById("test");

const ctx = canvas.getContext("2d");

let x;
let y;

let mousedown = false;

window.onmousedown = (e) =>{
  let left = e.clientX 
  let right = e.clientY
  socket.emit('down', {left,right});
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
  mousedown = true;

};

socket.on('onDown',({x,y})=>{
  console.log("idhar aya me")
  ctx.moveTo(x - canvas.offsetLeft, y - canvas.offsetTop);
})

window.onmouseup = (e) =>{
  mousedown = false;
}

socket.on('onDraw',({x,y})=>{
  ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = brushColor;
    ctx.lineTo(x - canvas.offsetLeft, y - canvas.offsetTop);
    ctx.stroke();
})

window.onmousemove = (e) =>{
  x = e.clientX;
  y = e.clientY;

    if(mousedown){
      socket.emit('draw',{x,y});
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = brushColor;
    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();
    // ctx.beginPath();
    
    }
};
  