import React, { Component } from 'react';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import loader from './assets/images/infinity-svg.svg';

class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            loading: 0
        }
    }

    loginAuthentication = e => {
        e.preventDefault();
        this.setState({loading:1});
        localStorage.setItem('username', this.state.username);
        var data = {
            "username": this.state.username,
            "password": this.state.password
        }
        try {
            Axios.post('https://focususermanagement.herokuapp.com/somethingLogin/', data).then(response => {
                this.setState({loading:0});
                if (response.data.error === undefined) {
                    console.log(response);
                    this.props.p.userHasAuthenticated(true, response.data[0]['_profile__uid'], response.data[0]['username']);
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
                    {(this.state.loading)?<img className='lloader' src={loader} alt="Loading.." />:<input disabled={(this.state.username.length&&this.state.password.length)?"":"disabled"} type='submit' onClick={this.loginAuthentication} className='loginButton' value='Submit' />}
                </div>
                <ToastContainer autoClose={3000} hideProgressBar={true}/>
            </div>
        )
    }
}

export default Login;