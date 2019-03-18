import React, { Component } from 'react'
import FOCUS from './focus';
import Dashboard from './dashboard';

class Home extends Component {
    render() {
        return (<div>
            {this.props.isAuthenticated?<Dashboard username={this.props.username} unique_id={this.props.unique_id}/>:<FOCUS p={this.props}/>}
        </div>)
    }
}

export default Home;