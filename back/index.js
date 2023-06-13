
const express = require("express");
const socketIO = require('socket.io');
const http = require('http');
const cors  = require("cors");
const session = require('express-session');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require( 'body-parser');
const routes = require('./routes/auth');
const rooms = require('./routes/rooms');
const chat = require('./routes/chat');
const User = require('./model/user')
const Message = require('./model/messages')
const Room = require('./model/room')

const app = express(); 
const server = http.createServer(app);



// TODO: add cors to allow cross origin requests
const io = socketIO(server, {
  cors: {
    origin: '*',
  }
});
app.use(cors({origin: 'http://localhost:3000', credentials:true }))



dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



// Connect to the database
// TODO: your code here

mongoose.connect(process.env.MONGO_URL);
const database = mongoose.connection;

database.on('error', (error) => console.error(error));
database.once('open', () => console.log("Connected to Database"))



// Set up the session
// TODO: your code here
const sessionMiddleware = session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
})

app.use(sessionMiddleware);
app.use("/api/auth/", routes);


app.get('/', (req, res) => {
  if (req.session && req.session.authenticated) {
    res.json({ message: "logged in" });
  }
  else {  
    console.log("not logged in")
    res.json({ message: "not logged" });
  }
});



app.use("/api/rooms/", rooms);
app.use("/api/chat/", chat);

// checking the session before accessing the rooms
app.use((req, res, next) => {
  if (req.session && req.session.authenticated) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
});




// Start the server
server.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});


// TODO: make sure that the user is logged in before connecting to the socket
// TODO: your code here
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

io.use((socket, next) => {
  if( socket.request.session && socket.request.session.authenticated) {
    next();
  } else {
    console.log("unauthorized")
    next(new Error('unauthorized'));
  }
})



/*io.on('connection', (socket)=>{
  console.log("user connected");
  // TODO: write codes for the messaging functionality
  // TODO: your code here
  let roomID = ""
  let user = ""
  socket.on('join', (data) => {
    socket.join(data.roomID);
    roomID = data.roomID
    user = data.name
    console.log("joined room");
    socket.emit('joinedRoom', roomID);
  });

  socket.on('message', async (data) => {
    const name = await User.findOne({username: user})
    const room = await Room.findOne({name: roomID})
    //console.log(user)
    //console.log(roomID)
    const newMessage = new Message ({
      sender: name._id,
      message: {
        text: data,
      },
      room: room._id 
    })
    console.log(newMessage)
    await newMessage.save()
    .then(() => {
      console.log("Message saved to db");
      io.emit('message', newMessage);
    })
  })

  socket.on('getChats', (roomId) => {
    User.find({room: roomId}, (err, chats) => {
      if (err || !user) {
        console.log("user not a member");
        return;
      }
      Chat.find({room: roomId}, (err, chats) => {
        if (err) {
          return console.log("couldnt get chats");
        }
      }); 
    });
});

  socket.on("disconnect", () =>{
    console.log("user disconneted")
  })
});*/

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log("User connected");

  socket.on('join', (data) => {
    socket.join(data.roomID);
    console.log("Joined room: ", data.roomID);
  });

  socket.on('message', async (data) => {
    const { roomID, name, text } = data;
    console.log(name)
    console.log(roomID)
  
    try {
      const sender = await User.findOne({ username: name });
      const room = await Room.findOne({ name: roomID });
  
      if (!room) {
        // Handle the case where the room with the given name does not exist
        console.error("Room not found:", roomID);
        return;
      }
  
      const newMessage = new Message({
        sender: sender._id,
        message: {
          text: text,
        },
        room: room._id,
      });
  
      await newMessage.save();
  
      io.to(roomID).emit('message', newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on('getChats', async (roomId) => {
    const room = await Room.findOne({ name: roomId });
    try {
      const messages = await Message.find({ room: room._id }).populate('sender');
  
      // Extract the necessary data from messages to send to the client
      const chatData = messages.map((message) => ({
        _id: message._id,
        sender: message.sender.username,
        text: message.message.text,
      }));
      console.log('Server sending chat data:', chatData); // Add this line to log the sent data
      socket.emit('chats', chatData);
  
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  });

  socket.on('editMessage', async (data) => {
    // data should contain messageId and newText, like { messageId, newText }
    try {
      const message = await Message.findById(data.messageId).populate('sender').populate('room');
      if (message) {
        message.message.text = data.text;
        await message.save();
  
        // Broadcast updated message to everyone in the room
        io.to(message.room.name).emit('messageUpdated', {
          _id: message._id,
          sender: message.sender.username,
          text: message.message.text,
          room: message.room.name
        });
      } else {
        console.log("Message not found");
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  });
});