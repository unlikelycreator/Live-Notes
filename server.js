const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors()); // Allow all origins (for testing)
app.use(express.json());

// Proxy route to bypass CORS
app.get('/send-sms', async (req, res) => {
    try {
        const url = "https://dealsms.in/api/send?number=919011484104&type=text&message=Hansraj%20want%20to%20contact%20you&instance_id=67AEF14389DEC&access_token=677fb4df0f3a8";
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to send SMS" });
    }
});



// Store uploaded files in 'uploads' folder
const upload = multer({ dest: 'uploads/' });

let sharedText = "";

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    io.emit('fileUploaded', { fileName: req.file.originalname, fileUrl });
    res.json({ fileName: req.file.originalname, fileUrl });
});

// Handle socket connection
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.emit('updateText', sharedText);

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
