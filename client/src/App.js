import React, { Component, Fragment } from 'react';
import './App.css';
import Routes from './Routes';
import {withRouter} from 'react-router-dom';

class App extends Component {

  constructor(props) {
    super(props);
  
    this.state = {
      isAuthenticated: false,
      unique_id: ""
    };
  }
  
  userHasAuthenticated = (authenticated, unique_id) => {
    if(authenticated)
      this.setState({ isAuthenticated: authenticated, unique_id:unique_id});
    else
      this.setState({ isAuthenticated: authenticated});
  }

  handleLogout = ()=>{
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
        {this.state.isAuthenticated?"YES":"NO"}
        <Routes childProps={childProps} />
      </div>
    );
  }
}

export default withRouter(App);