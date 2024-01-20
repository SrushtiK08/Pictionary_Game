const port = 3000;
// const { Server } = require('socket.io');
// import {io} from 'socket.io-client';
// const {io} = require('socket.io-client')

const msgform = document.getElementById('msg-form');
const chtMessages = document.querySelector('.msgBox');

const socket = io.connect('http://localhost:3000/');


//Message from Server
socket.on('message',message=>{
    // console.log(message);

    //function for outing the message in the msg box
    outputMessage(message);
    

    //automated scrolling of the messgae tab
    chtMessages.scrollTop = chtMessages.scrollHeight;
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
    div.innerHTML = `<p> ${message} </p>`;

    document.querySelector('.msgBox').appendChild(div);
}


  


