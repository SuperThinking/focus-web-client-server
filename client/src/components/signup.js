import React, { Component } from 'react';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import loader from './assets/images/infinity-svg.svg';

class Signup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            email: "",
            first_name: "",
            loading: 0
        }
    }

    signupAuthentication = e => {
        e.preventDefault();
        this.setState({loading:1});
        var data = {
            'user': {
                "username": this.state.username,
                "password": this.state.password,
                "email": this.state.email,
                "first_name": this.state.first_name,
                "last_name": ""
            },
            "location": "",
            "bio": ""
        }
        try {
            Axios.post('https://focususermanagement.herokuapp.com/somethingRegister/', data).then(response => {
                this.setState({loading:0});
                if (response.data.success) {
                    this.props.location('login');
                }
                else {
                    toast.info("Error in creating account", {
                        position: toast.POSITION.TOP_CENTER
                    });
                }
            })
                .catch(error => {
                    this.setState({loading:0});
                    toast.info("Error in creating account", {
                        position: toast.POSITION.TOP_CENTER
                    });
                })
        } catch (e) {
            alert(e.message);
        }
    }

    handleChange = e => this.setState({ [e.target.name]: e.target.value })

    render() {
        return (
            <div className='lsForm'>
                <div>
                    <div className='uniqueInput'>
                        <span className="inputInfo">Name</span>
                        <br />
                        <input onChange={this.handleChange} type='text' className='loginInput' name="first_name" />
                        <br />
                    </div>
                    <div className='uniqueInput'>
                        <span className="inputInfo">Username</span>
                        <br />
                        <input onChange={this.handleChange} type='text' className='loginInput' name="username" />
                        <br />
                    </div>
                    <div className='uniqueInput'>
                        <span className="inputInfo">Email</span>
                        <br />
                        <input onChange={this.handleChange} type='text' className='loginInput' name="email" />
                        <br />
                    </div>
                    <div className='uniqueInput'>
                        <span className="inputInfo">Password</span>
                        <br />
                        <input onChange={this.handleChange} type='password' className='loginInput' name="password" />
                    </div>
                    <div className='uniqueInput'>
                        {this.state.loading?<img className='lloader' src={loader} alt="Loading.." />:<input disabled={(this.state.username.length && this.state.password && this.state.first_name && this.state.email) ? "" : "disabled"} onClick={this.signupAuthentication} type='submit' className='loginButton' value='Submit' />}
                    </div>
                </div>
                <ToastContainer autoClose={3000} hideProgressBar={true} />
            </div>
        )
    }
}

export default Signup;