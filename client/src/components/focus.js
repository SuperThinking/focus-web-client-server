import React, { Component } from "react";
import './styles/focus.css';
import ExtensionApp from "./extensionApp";
import Login from "./login";
import Signup from "./signup";
class FOCUS extends Component {
    render() {
        return (<div className="mainBody">
            <div className='leftPanel panel'>
                <h1>Increase Your</h1>
                <h1>PRODUCTIVITY</h1>
            </div>
            <div className='rightPanel panel'>
                {this.props.p.location==='initial'?<ExtensionApp />:this.props.p.location==='login'?<Login p={this.props.p}/>:<Signup location={this.props.p.internalRouting}/>}
            </div>
        </div>)
    }
}

export default FOCUS;