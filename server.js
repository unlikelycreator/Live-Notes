// Importing required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let sharedText = ""; // Store the shared text

// Serve static files from public folder
app.use(express.static('public'));

// Handle socket connection
io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Send the current text to the new user
    socket.emit('updateText', sharedText);
    
    // Listen for text updates
    socket.on('textChange', (newText) => {
        sharedText = newText;
        socket.broadcast.emit('updateText', sharedText);
    });
    
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

