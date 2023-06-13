import React from "react";
import { io } from "socket.io-client";
import { Button, TextField, Typography } from "@mui/material";

const server_url = "http://localhost:3001";

class Chatroom extends React.Component {
  constructor(props) {
    super(props);
    this.socket = io(server_url, {
      cors: {
        origin: server_url,
        credentials: true,
      },
      transports: ["websocket"],
    });
    this.state = {
      messages: [],
      chatInput: "",
      editingIndex: -1,
      editText: "",
    };
  }

  componentDidMount() {
    const { room, name } = this.props;

    this.socket.emit("join", { roomID: room, name });

    this.socket.on("message", (message) => {
      console.log(message);
      this.setState((prevState) => ({
        messages: [...prevState.messages, message],
      }));
      this.socket.emit("getChats", this.props.room);
    });

    this.socket.on("chats", (chatData) => {
      console.log('Received chat data:', chatData); //add this line to log the received data
      this.setState({ messages: chatData });
  });
  this.socket.on("messageUpdated", (data) => {
    const { _id, text } = data;
    this.setState((prevState) => ({
      messages: prevState.messages.map((message) =>
        message._id === _id ? { ...message, text: text } : message
      ),
    }));
  });

    //fetch chat history when component mounts
    this.socket.emit("getChats", room);
  }

  handleInputChange = (e) => {
    this.setState({ chatInput: e.target.value });
  };

  handleSendChat = () => {
    const { room, name } = this.props;
    const { chatInput } = this.state;

    this.socket.emit("message", {
      roomID: room,
      name: name,
      text: chatInput,
    });

    this.setState({ chatInput: "" });
  };

  handleEditClick = (messageId) => {
    const { messages } = this.state;
    const message = messages.find(message => message._id === messageId);
    this.setState({
      editingIndex: messageId,
      editText: message.text,
    });
  };

  handleSaveClick = () => {
    const { editText, editingIndex } = this.state;
    const updatedText = editText.trim();

    //notify server of editing messages and
    //send server the updated texts and message id
    this.socket.emit("editMessage", {
      messageId: editingIndex, 
      text: updatedText,
    });

    //reset edit box
    this.setState({
      editingIndex: -1,
      editText: "",
    });
  };

  handleEditInputChange = (e) => {
    this.setState({ editText: e.target.value });
  };

  

  render() {
    const { messages, chatInput, editingIndex, editText } = this.state;
    const { name } = this.props; //the current user's name
  
    return (
      <div>
        {/* display msgs */}
        {messages.map((message, index) => (
          <div key={message._id}>
            {editingIndex === message._id ? (
              <div>
                <TextField
                  value={editText}
                  onChange={this.handleEditInputChange}
                  label="Edit Message"
                />
                <Button onClick={this.handleSaveClick}>Save</Button>
              </div>
            ) : (
              <div>
                <Typography>{message.sender + ": " + message.text}</Typography>
                {message.sender === name ? (
                  <Button onClick={() => this.handleEditClick(message._id)}>Edit</Button>
                ) : null}
              </div>
            )}
          </div>
        ))}
  
        {/* chat box */}
        <TextField
          value={chatInput}
          onChange={this.handleInputChange}
          label="Chat Message"
        />
        <Button onClick={this.handleSendChat}>Send</Button>
  
        <Button onClick={() => this.props.changeScreen("lobby")}>Back</Button>
      </div>
    );
  }
}  

export default Chatroom;
