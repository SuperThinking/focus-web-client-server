import React, {Component} from 'react';
import Axios from 'axios';

class Login extends Component
{
    state = {
        username:"",
        password:""
    }
    loginUser = (e)=>{
        e.preventDefault();
        var data = {
            "username": this.state.username,
            "password": this.state.password
        }
        Axios.post("/login", data).then(response=>{
            console.log(response);
        })
    }
    handleChange = (e)=>{
        console.log(e.target.name)
        this.setState({[e.target.name]:e.target.value})
    }
    render()
    {
        return(
            <div>
                <h1 align='center'>Dummy Login Page</h1>
                <form align='center'>
                    <input name='username' type='text' placeholder='username' value={this.state.username} onChange={this.handleChange}/>
                    <input name='password' type='password' placeholder='password' value={this.state.password} onChange={this.handleChange}/>
                    <br/><br/>
                    <input type='submit' name='Login' onClick={this.loginUser}/>
                </form>
            </div>
        )
    }
}

export default Login;