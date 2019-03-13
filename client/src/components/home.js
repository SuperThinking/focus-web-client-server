import React, { Component } from 'react'
import Axios from 'axios';
import FOCUS from './focus';
import Dashboard from './dashboard';

class Home extends Component {
    render() {
        return (<div>
            {this.props.isAuthenticated?<Dashboard unique_id={this.props.unique_id}/>:<FOCUS p={this.props}/>}
        </div>)
    }
}

export default Home;