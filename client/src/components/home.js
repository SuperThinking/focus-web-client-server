import React, { Component } from 'react'
import Axios from 'axios';
import FOCUS from './focus';

class Home extends Component {
    render() {
        return (<div>
            {this.props.isAuthenticated?<div>Signed In</div>:<FOCUS p={this.props}/>}
        </div>)
    }
}

export default Home;