import React, { Component } from 'react';
import './App.css';
import Routes from './Routes';
import { withRouter } from 'react-router-dom';
import NavBar from './components/navBar';
import FOCUS from './components/focus';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: false,
      unique_id: ""
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
    this.props.history.push("/login");
  }

  render() {
    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated,
      unique_id: this.state.unique_id
    };



    return (
      <div>
        <NavBar />
        <div className='belowNavbar'>
          <FOCUS />
        </div>
      </div>
    );
  }
}

export default withRouter(App);