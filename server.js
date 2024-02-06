const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

mongoose.connect('mongodb+srv://Atlas:Atlas1234@cluster0.eiqjjzp.mongodb.net/');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

const notificationSchema = new mongoose.Schema({
    message: String,
    timestamp: { type: Date, default: Date.now },
});
const Notification = mongoose.model('Notification', notificationSchema);

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

app.post('/notification', async (req, res) => {
    try {
        const { message } = req.body;
        const notification = new Notification({ message });
        await notification.save();
console.log(notification)
        // Emit the new notification to all connected clients
        io.emit('newNotification', notification);

        res.status(201).json({ success: true, notification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});


