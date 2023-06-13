import React from "react";
import { Button } from "@mui/material";
import speakeasy from 'speakeasy';

const server_url = "http://localhost:3001";

class Fa extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            qr: "",
            key: "",
            input: "",
            counter: 0
        }
        
    }

    componentDidMount() {
        fetch(server_url + '/api/auth/qrcode', {
            method: 'GET',
            mode: 'cors',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(res => res.json())
        .then(json => {
            if(json.status) {
                console.log(json)
                this.setState({qr:json.qrcode})
                this.setState({key:json.secret})
            }
        })
    }

    handleInput = (e) => {
        this.setState({input: e.target.value})
    }

    validate = () => {
    console.log(this.state.key)
    console.log(this.state.input)
        const verification = speakeasy.hotp.verify({
            secret: this.state.key,
            counter: this.state.counter,
            token: this.state.input,
        });
        console.log(verification)
        if(verification) {
            alert("2FA was successful.")
            this.props.changeScreen('lobby');
            this.setState({counter: this.state.counter +1});
        }else {
            alert("2FA unsuccessful")
        }
    }

    

    render() {
        return (
        <div>
            <img src={this.state.qr} alt="QR Code" />
            <p>Please scan the qr code with an authenticator like Google Authenticator</p>
            <p>This generates a one time code to verify yourself.</p>
            <input type="text" value={this.input} onChange={(e) => this.handleInput(e)} placeholder = "Ex: 123456"></input>
                <Button variant="contained" onClick={this.validate}>Submit</Button>
        </div>)
    }
}

export default Fa;