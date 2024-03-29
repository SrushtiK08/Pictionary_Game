const port = 3000;
const msgform = document.getElementById('msg-form');
const chtMessages = document.querySelector('.msgBox');
const roomName = document.querySelector('.roomCode');
const userList = document.getElementById('joinedUsersList');
const startGameBtn = document.getElementById('startGameBtn');
const socket = io();
const botName = 'Game Bot';
var crnt_user ;

let brushColor = '#000000';
let brushSize = 5;

var right_word = 'random';


// Getting username and room from URL
var { username, roomID } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

console.log('here',username,roomID);
var rrr;


// Join the room or create a new one
if (roomID === undefined) {
  // If no room is provided, generate a random room code
  roomID = generateRoomCode();
  rrr = roomID;
  console.log(username, roomID);
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

socket.on('message_checking',({msg,crctMsg,normalMsg,id})=>{
     if(id===crnt_user){
    console.log(`Message_checking : ${msg} : ${crctMsg} : ${normalMsg} :${right_word}`);
     }
     else{
    if(msg.toLowerCase()===right_word.toLowerCase()){
      outputMessage(crctMsg);
      console.log(`sabko wale fxn me id : ${id}`);
      socket.emit('increase_points',id);
      console.log('sabko mila k nai');
    }
    else{
      console.log('ek ko mila');
      outputMessage(normalMsg);
    }
    chtMessages.scrollTop = chtMessages.scrollHeight;
  }
})


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

let candraw = true;

socket.on('cantDraw',(value)=>{
  candraw = value;
});


socket.on('canDraw',(value)=>{
  candraw = value;
});

//CANVAS PART

const canvas = document.getElementById("drawingCanvas");
// let test = document.getElementById("test");

const ctx = canvas.getContext("2d");

let x;
let y;

let mousedown = false;


window.onmousedown = (e) =>{
  if(!candraw) return;
  let left = e.clientX 
  let right = e.clientY
  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.strokeStyle = brushColor;
  ctx.moveTo(x - canvas.offsetLeft, y- canvas.offsetTop);
  socket.emit('down', { x, y, color: brushColor , size : brushSize});
  mousedown = true;
  
};

socket.on('onDown',({x,y,color,size})=>{
  
  // ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.lineWidth = size;
  ctx.strokeStyle = color;
  ctx.moveTo(x - canvas.offsetLeft, y - canvas.offsetTop);
})


window.onmouseup = (e) =>{
  if(!candraw) return;
  mousedown = false;
  socket.emit('up',({x :e.clientX,y : e.clientY,color :e.color,size :e.size}))
  ctx.stroke();
  ctx.beginPath();
}

socket.on('onDraw',({x,y,color,size})=>{
  ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineTo(x - canvas.offsetLeft, y - canvas.offsetTop);
    ctx.stroke();  
})

socket.on('onUp',({x,y,color,size})=>{
     ctx.stroke();
     ctx.beginPath();
});

window.onmousemove = (e) =>{
  x = e.clientX;
  y = e.clientY;


    if(mousedown){
      const color = brushColor;
      const size = brushSize
      socket.emit('draw',{x,y,color,size});
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();
    }
};
  

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  mousedown = false;
  brushColor = defaultBrushColor;
  ctx.beginPath();
}


const brushColorInput = document.getElementById('brushColor');
    brushColorInput.addEventListener('input', () => {
      brushColor = brushColorInput.value;
      socket.emit('brushColorChanged', brushColor);
    });

    // Receive brush color change from other clients
socket.on('brushColorChanged', (color) => {
  // ctx.closePath();
  brushColor = color;
});
  
    // Brush size input
    const brushSizeInput = document.getElementById('brushSize');
    brushSizeInput.addEventListener('input', () => {
      // ctx.closePath();
      brushSize = brushSizeInput.value;
    });
  
    // Eraser button
    const eraserBtn = document.getElementById('eraserBtn');
    eraserBtn.addEventListener('click', () => {
      clearCanvas();
    });

// Update brush color
brushColorInput.addEventListener('input', () => {
  // ctx.closePath();
  brushColor = brushColorInput.value;
  socket.broadcast.emit('brushColorChanged', brushColor);
});

// Update brush size
brushSizeInput.addEventListener('input', () => {
  brushSize = brushSizeInput.value;
  socket.broadcast.emit('brushSizeChanged', brushSize);
});

// Broadcast brush color and size changes to other clients
socket.on('brushColorChanged', (color) => {
  brushColor = color;
});

socket.on('brushSizeChanged', (size) => {
  brushSize = size;
});

// Add the following code to broadcast canvas clearing to other clients

// Eraser button
eraserBtn.addEventListener('click', () => {
  clearCanvas();
  socket.emit('clearCanvas');
});

// Broadcast canvas clearing to other clients
socket.on('clearCanvas', () => {
  clearCanvas();
});

// Update the clearCanvas function
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  mousedown = false;
  ctx.beginPath();
}



//GAMING PARTS


socket.on('hostStatus', (isHost) => {
  const startButton = document.getElementById('startGameBtn');
  if (isHost) {
    startGameBtn.addEventListener('click', () => {
      // Emit a message to start the game if the user is the host
      console.log('game is starting');
      socket.emit('startGame');
    });
    
  } else {
   
    startButton.addEventListener('click', ()=>{
      alert("Only host can start the game!!");
    })
  }

});



//IMPLEMENTING ROUND PARTS


socket.on('wordToDraw', (word) => {
  console.log(`Word to draw: ${word}`);
  
});


socket.on('wordLength', (length) => {
  console.log(`Word length: ${length}`);
});

// Event listener for game over
socket.on('gameOver', () => {
  console.log('Game over')  
});


socket.on('wordToDraw', (word) => {
  // right_word = word;
  console.log(`Word to draw: ${word}`);
  displayWordToDraw(word);
});


socket.on('wordLength', (length) => {
  console.log(`Word length: ${length}`);
  displayWordLength(length);
});



socket.on('checkEmit',(number)=>{
  console.log("check emit is working here");
});

function displayWordToDraw(word) {
  const wordToGuess = document.getElementById('wordToGuess');
  wordToGuess.innerText = `Word to Draw: ${word}`;
}

// Function to display the word length for guessing players
function displayWordLength(length) {
  const wordToGuess = document.getElementById('wordToGuess');
  const underscores = ' _ '.repeat(length); // Constructs a string of underscores with the specified length
  wordToGuess.innerText = `Word : ${underscores}`;

}


//ROUND DETAILS


socket.on('startRound', (roundNumber) => {
  // Update the UI to display the current round number
  // Reset the canvas
  clearCanvas();
  console.log(`Starting round ${roundNumber}`);
  displayRoundNumber(roundNumber); // Function to display current round
  startTimer(10); // Function to start the timer
});

function displayRoundNumber(roundNumber) {
  const roundNumberElement = document.getElementById('roundNumber');
  if(roundNumber<=3){
  roundNumberElement.innerText = `Round ${roundNumber}`;}
  else{
    roundNumberElement.innerText = `Game Ended`;
  }
}

socket.on('startTimer',(duration)=>{
  let countdown = duration;
  const countdownElement = document.getElementById('countdown');

  // Update the countdown every second
  const timerInterval = setInterval(() => {
      countdown--;
      countdownElement.innerText = `${countdown}s`;

      if (countdown <= 0) {
        clearCanvas();
          clearInterval(timerInterval);
          // Handle timer expiration here (switch to the next user or end round)
      }
  }, 1000);
})


//checking 
socket.on('checker',({word,id})=>{
  right_word = word;
  crnt_user = id;
  console.log(`checker wrk : ${right_word}`);
})

socket.on('Overlaying',(user)=>{
  // console.log(`overlaying : ${value}`);
  let timerInSeconds = 5;

  const classAdd = document.getElementById('PopContainer');
  classAdd.innerHTML = `<h3 id="TimerBig">Next User to draw : ${user}<\h3>
  <p id="timer"><span>${timerInSeconds}</span> </p>`;

  // Display the popup
  
  const userAdd = document.getElementById('UserScores');
  userAdd.innerHTML=``;
  // Start the countdown timer
  const timerElement = document.getElementById('timer');
  const countdown = setInterval(() => {
    timerInSeconds--;
    timerElement.innerHTML = `<span>${timerInSeconds}</span>`;

    if (timerInSeconds <= 0) {
      clearInterval(countdown);
    }
  }, 1000);

  displayPop();
});

socket.on('HideOverlay',(value)=>{
  hidePop();
})

socket.on('EndDetails',({user_list,currentRound})=>{
  const classAdd = document.getElementById('PopContainer');
  classAdd.innerHTML = `<h2>Current LeaderBoard for Round ${currentRound}<\h2>`;
  const userAdd = document.getElementById('UserScores');
  // const userAdd = document.getElementById('UserScores');
  userAdd.innerHTML=``;
  user_list.forEach((user) => {
      const li = document.createElement('li');

      li.appendChild(document.createTextNode(` ${user.username} : ${user.points}`));

      // Append the <li> to the user list
      userAdd.appendChild(li);
    });

    displayPop();
})

socket.on('FinalRank',(user_list)=>{
  const classAdd = document.getElementById('PopContainer');
  classAdd.innerHTML = `<h2>Final LeaderBoard <\h2>`;
  const userAdd = document.getElementById('UserScores');
  userAdd.innerHTML=``;
  user_list.forEach((user) => {
      const li = document.createElement('li');

      li.appendChild(document.createTextNode(` ${user.username} : ${user.points}`));

      // Append the <li> to the user list
      userAdd.appendChild(li);
    });

    displayPop();
})

socket.on('HideEndDetails',(RoomId)=>{
  hidePop();
})

function displayPop(){
  document.body.classList.add("active-popup");
}

function hidePop(){
  document.body.classList.remove("active-popup");
}

document.getElementById('openPopup').addEventListener('click',function(){
  console.log("here")
  document.body.classList.add("active-popup");
})



document.getElementById('popup-close').addEventListener("click",function(){
  document.body.classList.remove("active-popup");
});