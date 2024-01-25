// const socket = io();
// const port = 3000;
// let io = require("socket.io")

// var io = io.connect("http://localhost:3000/");


    const canvas = document.getElementById('drawingCanvas');
    const context = canvas.getContext('2d');
    let isDrawing = false;
  
    // Brush settings
    let brushColor = '#000000';
    let brushSize = 5;
  
    function startDrawing(e) {
      isDrawing = true;
      draw(e);
      socket.emit('startDrawing');
    }
  
    function stopDrawing() {
      isDrawing = false;
      context.beginPath();
    }
  
io.on('onDraw' , ({x,y})=>{
  context.lineTo(x,y);
  context.stroke();
})

    function draw(e) {
      if (!isDrawing) return;

      console.log('I am here');
      context.lineWidth = brushSize;
      context.lineCap = 'round';
      context.strokeStyle = brushColor;
      x = e.clientX;
      y = e.clientY;
      io.emit('draw',{x,y});
      context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
      context.stroke();
      context.beginPath();
      context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
      data = "ehrer";
      socket.emit('draw', data);
    }
  
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
  
    // Brush color input
    const brushColorInput = document.getElementById('brushColor');
    brushColorInput.addEventListener('input', () => {
      brushColor = brushColorInput.value;
    });
  
    // Brush size input
    const brushSizeInput = document.getElementById('brushSize');
    brushSizeInput.addEventListener('input', () => {
      brushSize = brushSizeInput.value;
    });
  
    // Eraser button
    const eraserBtn = document.getElementById('eraserBtn');
    eraserBtn.addEventListener('click', () => {
      // brushColor = '#f2f2f2'; // Set the color to match the background (white) for erasing
      clearCanvas();
    });

    socket.on('startDrawing', () => {
      // Implement the logic to show some indication that someone else is drawing
      console.log("I am working perfect")
      context.beginPath();
    });
  
    // Listen for 'draw' event and update the canvas
    socket.on('draw', (data) => {
      context.lineWidth = data.size;
      context.lineCap = 'round';
      context.strokeStyle = data.color;
  
      context.lineTo(data.x, data.y);
      context.stroke();
      context.beginPath();
      context.moveTo(data.x, data.y);
    });
  
    // Function to clear the canvas
    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        isDrawing = false;
    brushColor = defaultBrushColor;
    context.beginPath();
    }
  