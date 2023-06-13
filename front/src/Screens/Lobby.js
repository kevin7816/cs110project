import React from "react";
import {io} from 'socket.io-client';
import Chatroom from './Chatroom'
import { Button } from "@mui/material";

class Lobby extends React.Component{
    constructor(props){
        super(props);
        this.socket = io('http://localhost:3000');
        this.state = {
            rooms: undefined,
            roomID: "",
        }
    }

    componentDidMount(){
        // TODO: write codes to fetch all rooms from serve
        console.log("in lobby")
        fetch(this.props.server_url + '/api/rooms/all', {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => {
            res.json().then((data) => {
                this.setState({rooms:data})
            })
        });
    }

    roomSelect = (room) => {
        //this.socket.emit("join", {"room":room, "name": this.props.name})
        this.props.changeRoom(room)
        this.props.changeScreen("chatroom")
    }

    handleInput = (e) => {
        this.setState({roomID: e.target.value})
    }

    joinRoom = () => {
        fetch(this.props.server_url + '/api/rooms/join', {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                'Accept': 'application/json'
            },
            body: JSON.stringify({name: this.state.roomID})
        })
        .then(res => res.json())
        .then(json => {
            if(json.status) {
                this.props.changeRoom(this.state.roomID)
                this.props.changeScreen("chatroom")
            } else {
                alert(json.msg);
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    createRoom = () => {
        console.log(JSON.stringify(this.state.roomID))
        fetch(this.props.server_url + '/api/rooms/create', {
            method: "POST",
            mode: 'cors',
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                'Accept': 'application/json'
            },
            body: JSON.stringify({name: this.state.roomID})
        })
        .then(res => res.json())
        .then(json => {
            if(json.status) {
                this.props.changeRoom(this.state.roomID)
                this.props.changeScreen("chatroom")
            } else {
                alert(json.msg);
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    deleteRoom = () => {
        fetch(this.props.server_url + '/api/rooms/leave', {
            method: "DELETE",
            mode: 'cors',
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                'Accept': 'application/json'
            },
            body: JSON.stringify({name: this.state.roomID})
        })
        .then(res => res.json())
        .then(json => {
            if(json.status) {
                console.log(json.msg)
                this.setState({roomID:""})
            } else {
                alert(json.msg);
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    logout = () => {
        fetch(this.props.server_url + '/api/auth/logout', {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                'Accept': 'application/json'
            }
        })
        .then(res => res.json())
        .then(json => {
          if (json.status) {
            // Perform any necessary actions after logout
            this.props.changeScreen('auth'); // Switch back to the login screen
          } else {
            alert(json.msg || 'Logout failed.');
          }
        })
        .catch(err => {
          console.log(err);
        });
    }


    render(){
        return(
            <div>
                <h1>Lobby</h1>
                {this.state.rooms ? this.state.rooms.map((room) => {
                    return <Button variant="contained" key={"roomKey"+room} onClick={() => this.roomSelect(room)}>{room}</Button>
                }): "loading..."}
                {/* write codes to join a new room using room id*/}
                <div>
                <input type="text" value ={this.roomID} onChange={(e) => this.handleInput(e)} placeholder="Enter ID"></input>
                <Button variant ="contained" onClick={() => this.joinRoom()}>Join Room</Button>
                <Button variant ="contained" onClick={this.createRoom}>Create Room</Button>
                <Button variant ="contained" onClick={this.deleteRoom}>Leave Room</Button>
                <Button variant="contained" color="secondary" onClick={this.logout}>Logout</Button>
                </div>
                {/* write codes to enable user to create a new room*/}
                
            </div>
        );
    }
}

export default Lobby;