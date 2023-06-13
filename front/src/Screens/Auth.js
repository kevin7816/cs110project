import React from "react";
import Form from "../Components/form.js";
import { Button } from "@mui/material";

const server_url = "http://localhost:3001";

class Auth extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            showForm: false,
            selectedForm: undefined,
        }
    }

    closeForm = () => {
        this.setState({showForm: false});
    }

    login = (data) => {
        // TODO: write codes to login
        fetch(server_url + '/api/auth/login', {
            method: 'POST',
            mode: 'cors',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(json => {
            if (json.status) {
                this.props.changeScreen('fa');
                this.props.changeName(json.username);
            } else {
                alert(json.msg);
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    register = (data) => {
        // TODO: write codes to register
        console.log("trying to sign up");
        fetch(server_url + '/api/auth/signup', {
            method: 'POST',
            mode: 'cors',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'

            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(json => {
            if (json._id) {
                alert("Registered successfully. Please login.");
                this.setState({showForm: false});
            } else {
                alert( 'Registration failed.');
            }
        })
        .catch(err => {
            console.log(err);
        });
        console.log(data);
    }

    render(){
        let display = null;
        if (this.state.showForm){
            let fields = [];
            if (this.state.selectedForm === "login"){
                fields = ['username', 'password'];
                display = <Form fields={fields} close={this.closeForm} type="login" submit={this.login} key={this.state.selectedForm}/>;
            }
            else if (this.state.selectedForm === "register"){
                fields = [ 'username', 'password', 'name'];
                display = <Form fields={fields} close={this.closeForm} type="register" submit={this.register} key={this.state.selectedForm}/>;
            }   
        }
        else{
            display = <div>
                <Button onClick={() => this.setState({showForm: true, selectedForm:"login"})}> Login </Button>
                <Button onClick={() => this.setState({showForm: true, selectedForm: "register"})}> Register </Button>
                </div>              
        }
        return(
            <div>
                <h1> Welcome to our website! </h1>
                {display}
            </div>
        );
    }
}

export default Auth;