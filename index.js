const http = require("http");
const server = http.createServer();
const {Server} = require("socket.io");
const io = new Server(server);
//const { addUser, removeUser, getUser,
//    getUsersInRoom } = require("./users");

const PORT = process.env.PORT || 3000;

///////
const users = [];

const addUser = ({id, name, room}) => {
//    name = name.trim().toLowerCase();
//    room = room.trim().toLowerCase();

    const existingUser = users.find((user) => {
        user.room === room && user.name === name
    });

    if(existingUser) {
        return{error: "Username is taken"};
    }
    const user = {id,name,room};

    users.push(user);
    return {user};

}

const removeUser = (id) => {
    console.log("remove");
    const index = users.findIndex((user) => {
        user.id === id
        console.log("aa", id);
    });
    console.log("bb", index);

    if(index !== -2) {
        console.log("cc");
        return users.splice(index,1)[0];
    }
    console.log("remove3", users);
}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {addUser, removeUser, getUser, getUsersInRoom};

//////

io.on("connection", (socket) => {
    socket.on("position-change", (data) => {
        console.log(data);
        io.emit("position-change", data);
    });
    // socket.on("message", (data) => {
    //         console.log(data.roomID);
    //         io.to(data.roomID).emit('message', data.message);
    //     });

    socket.on("room", (name, room) => {

        console.log("room join", name);
        console.log("room join2", room);
        const { error, user } = addUser(
            { id: socket.id, name, room });
 
        if (error) return callback(error);

//        socket.emit('message', { user: 'admin', text:
//            `${user.name},
//            welcome to room ${user.room}.` });
 
        // Broadcast will send message to everyone
        // in the room except the joined user
        socket.broadcast.to(user.room)
            .emit('message', { user: "admin",
            text: `${user.name}, has joined` });
 
        socket.join(user.room);

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        console.log("room join3", room);
//        callback();

            // socket.join(data);
            // console.log("join room :", data);
            // io.to(data).emit("hi");
        });

        socket.on('sendMessage', (message, callback) => {
 
            const user = getUser(socket.id);
            io.to(user.room).emit('message',
                { user: user.name, text: message });
     
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
            callback();
        })

        socket.on("leave", (data) => {
            console.log("remove1");
            const user = removeUser(socket.id);
            if (user) {
                io.to(user.room).emit('message2',
                { user: 'admin', text:
                `${user.name} had left` });
            }
        });
        
        socket.on('disconnect', () => {
            console.log("remove1");
            const user = removeUser(socket.id);
            if (user) {
                io.to(user.room).emit('message2',
                { user: 'admin', text:
                `${user.name} had left` });
            }
        })

        
//    client.on('message', function name(data) {
//        console.log(data);
//        socketIO.emit('message', data);
//      })

//    //listens when a user is disconnected from the server
//      client.on('disconnect', () {
//        console.log('Disconnected...', client.id);
//      })
//
//    //listens when there's an error detected and logs the error on the console
//      client.on('error', (err) {
//        console.log('Error detected', client.id);
//        console.log(err);
//      })

});

server.listen(PORT, () => {
    console.log("listening on", PORT);
})