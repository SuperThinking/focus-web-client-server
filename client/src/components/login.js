import React, { Component } from 'react';
import Axios from 'axios';
import './styles/login.css'
class Login extends Component {
    state = {
        username: "",
        password: ""
    }
    loginUser = e => {
        e.preventDefault();
        var data = {
            "username": this.state.username,
            "password": this.state.password
        }
        try {
            Axios.post("/api/login", data).then(response => {
                if(response.data.status==="true")
                {
                    this.props.userHasAuthenticated(true, response.data.unique_id);
                    this.props.history.push("/");
                }
            });
        } catch (e) {
            alert(e.message);
        }
    }
    handleChange = (e) => {
        console.log(e.target.name)
        this.setState({ [e.target.name]: e.target.value })
    }
    componentDidUpdate()
    {
        if(this.props.isAuthenticated)
            this.props.history.push("/");
    }
    render() {
        return (
            <div align='center' className='full-login'>
                <h1>Login</h1>
                <form>
                    <input name='username' type='text' placeholder='username' value={this.state.username} onChange={this.handleChange} />
                    <input name='password' type='password' placeholder='password' value={this.state.password} onChange={this.handleChange} />
                    <br /><br />
                    <input disabled={this.state.username.length?"":"disabled"} className='submitForm' type='submit' name='Login' value='Login' onClick={this.loginUser} />
                </form>
            </div>
        )
    }
}

export default Login;