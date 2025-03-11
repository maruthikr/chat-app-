const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const users = new Set();

io.on('connection', (socket) => {
    console.log('A user is now connected');

    // Handle user joining
    socket.on("join", (userName) => {
        users.add(userName);
        socket.userName = userName;
        
        // Notify all users that someone joined
        io.emit('userJoined', userName);
        
        // Send updated user list
        io.emit('userList', Array.from(users));
    });

    // Handle incoming chat messages
    socket.on('chatMessage', (message) => {
        io.emit('chatMessage', message);
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        if (socket.userName) {
            users.delete(socket.userName); // Remove the user

            console.log(`${socket.userName} has disconnected`);
            
            io.emit('userLeft', socket.userName); // Notify users that someone left
            io.emit('userList', Array.from(users)); // Update user list
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
