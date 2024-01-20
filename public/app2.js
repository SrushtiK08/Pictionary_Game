document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('drawingCanvas');
    const context = canvas.getContext('2d');
    let isDrawing = false;
  
    // Brush settings
    let brushColor = '#000000';
    let brushSize = 5;
  
    function startDrawing(e) {
      isDrawing = true;
      draw(e);
    }
  
    function stopDrawing() {
      isDrawing = false;
      context.beginPath();
    }
  
    function draw(e) {
      if (!isDrawing) return;
  
      context.lineWidth = brushSize;
      context.lineCap = 'round';
      context.strokeStyle = brushColor;
  
      context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
      context.stroke();
      context.beginPath();
      context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
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
      brushColor = '#f2f2f2'; // Set the color to match the background (white) for erasing
      clearCanvas();
    });
  
    // Function to clear the canvas
    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
    }
  });