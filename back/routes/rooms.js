const express = require('express');
const router = express.Router()
const User = require('../model/user')
const Room = require('../model/room');
const session = require('express-session');
// TODO: add rest of the necassary imports


module.exports = router;

// temporary rooms
rooms = ["room1", "room2", "room3"]

//Get all the rooms
router.get('/all', async (req, res) => {
    // TODO: you have to check the database to only return the rooms that the user is in
    const username = req.session.username;
    //res.send(rooms)
        const user = await User.findOne({username})
        if (!user) {
            console.log("Didn't work");
        } else {
            console.log("in")
            console.log(user.rooms);
            res.send(user.rooms)
        }


});


router.post('/create', async (req, res) => {
    // TODO: write necassary code to Create a new room
    const {name} = req.body
    const username = req.session.username;
    const room = new Room ({name: name})


    const user = await User.findOne({username})
    if(user) {
        user.rooms.push(name);
    }else {
        console.error(error)
    }
    await user.save();

    try{
        const roomSaved = await room.save();
        res.json({msg: "Created Room", status: true})
    }
    catch(error) {
        console.log(error)
        res.send("ERROR!")
    }


});


router.post('/join', async (req, res) => {
    // TODO: write necassary codes to join a new room
    const {name} = req.body
    const username = req.session.username;
    const joinRoom = await Room.findOne({name})

    if(!joinRoom){
        return res.json({msg: "Room doesn't exist!", status: false });
    } else {
        const user = await User.findOne({username})
        if(user) {
            if(!user.rooms.includes(name)){
            user.rooms.push(name);
            }
        }else {
            console.error(error)
        }
        await user.save();
        return res.json({msg: "Room joined", status: true });
    }
});

router.delete('/leave', async (req, res) => {
    // TODO: write necassary codes to delete a room
    const {name} = req.body
    const username = req.session.username;
    const joinRoom = await Room.findOne({name})

    if(!joinRoom){
        return res.json({msg: "Room doesn't exist!", status: false });
    } else {
        const user = await User.findOne({username})
        if(user) {
            if(user.rooms.includes(name)){
            for(let i=0;i< user.rooms.length; i++){
                if(user.rooms[i] === name){
                    user.rooms.splice(i,1);
                    console.log("room deleted")
                    break;
                }
            }
            await Room.deleteOne({name: name})
            }
        }else {
            console.error(error)
        }
        await user.save();
        return res.json({msg: "Room deleted", status: true });
    }
});