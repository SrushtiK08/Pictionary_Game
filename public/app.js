const port = 3000;
// const { Server } = require('socket.io');
// import {io} from 'socket.io-client';
// const {io} = require('socket.io-client')

const msgform = document.getElementById('msg-form');
const chtMessages = document.querySelector('.msgBox');

const socket = io();

//getting username and room  from URL 
// const {username,room} = Qs.parse(location.search);

//Message from Server
socket.on('message',message=>{
    console.log(message);
    // console.log('I ma here')
    //function for outing the message in the msg box
    outputMessage(message);
    

    //automated scrolling of the messgae tab
    chtMessages.scrollTop = chtMessages.scrollHeight;
});

socket.on('user-connected', ({ username, roomID }) => {
    // Do something with the username and roomID, for example, store them in a variable
    console.log(`Connected: ${username} in room ${roomID}`);
    console.log('I ma here')
    // Now you can use the username and roomID as needed in your client-side code
});


//Message when submitted
msgform.addEventListener('submit',(e)=>{
    e.preventDefault();

    //Fetching the message here
    const msg = e.target.elements.messageInput.value;

    //Emitting my message to the server
    socket.emit('chatMessage',msg);


    //clearing out the input box
    e.target.elements.messageInput.value = "";
    e.target.elements.messageInput.focus();
});


//Output Message to Box
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('msgInputs');
    div.innerHTML = `<p class="meta"> ${message.username} <span>${message.time}</span> </p>
    <p class="text"> ${message.text}</p>`;

    document.querySelector('.msgBox').appendChild(div);
}


  


