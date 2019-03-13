import React, { Component } from 'react';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: ""
        }
    }

    loginAuthentication = e => {
        e.preventDefault();
        var data = {
            "username": this.state.username,
            "password": this.state.password
        }
        try {
            Axios.post("/api/login", data).then(response => {
                if (response.data.status === "true") {
                    console.log(response);
                    this.props.p.userHasAuthenticated(true, response.data.unique_id);
                    this.props.p.history.push("/");
                }
                else {
                    toast.info("Wrong Username or Password", {
                        position: toast.POSITION.TOP_CENTER
                    });
                }
            });
        } catch (e) {
            alert(e.message);
        }
    }

    handleChange = e => this.setState({ [e.target.name]: e.target.value })

    render() {
        return (
            <div className='lsForm'>
                <div className='uniqueInput'>
                    <span className="inputInfo">Email or Username</span>
                    <br />
                    <input type='text' className='loginInput' onChange={this.handleChange} name='username' />
                    <br />
                </div>
                <div className='uniqueInput'>
                    <span className="inputInfo">Password</span>
                    <br />
                    <input type='password' className='loginInput' onChange={this.handleChange} name='password' />
                </div>
                <div className='uniqueInput'>
                    <input disabled={this.state.username.length?"":"disabled"} type='submit' onClick={this.loginAuthentication} className='loginButton' value='Submit' />
                </div>
                <ToastContainer autoClose={3000} hideProgressBar={true}/>
            </div>
        )
    }
}

export default Login;