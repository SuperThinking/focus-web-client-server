import React, { Component } from 'react';
import './App.css';
import Routes from './Routes';
import { withRouter } from 'react-router-dom';
import NavBar from './components/navBar';
// import CryptoJS from 'crypto-js';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: false,
      unique_id: "",
      location: "initial"
    };
  }

  userHasAuthenticated = (authenticated, unique_id) => {
    if (authenticated) {
      this.setState({ isAuthenticated: authenticated, unique_id: unique_id });
      localStorage.setItem('user_session_key', unique_id);
    }
    else
      this.setState({ isAuthenticated: authenticated });
  }

  componentDidMount() {
    if (localStorage.getItem('user_session_key'))
      this.userHasAuthenticated(true, localStorage.getItem('user_session_key'));
  }

  handleLogout = () => {
    localStorage.clear();
    this.userHasAuthenticated(false);
    this.props.history.push("/");
  }

  internalRouting = (x) => {
    console.log(x);
    this.setState({location:x});
  }

  render() {
    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated,
      unique_id: this.state.unique_id,
      location:this.state.location
    };
    const navProps = {
      isAuthenticated: this.state.isAuthenticated,
      handleLogout: this.handleLogout,
      internalRouting: this.internalRouting
    }

    return (
      <div>
        <NavBar p={navProps}/>
        <div className='belowNavbar'>
          <Routes childProps={childProps} />
        </div>
      </div>
    );
  }
}

export default withRouter(App);