import React, { Component } from "react";
import './styles/focus.css';
import ExtensionApp from "./extensionApp";
class FOCUS extends Component {

    render() {

        return (<div className="mainBody">
            <div className='leftPanel panel'>
                <h1>Increase Your</h1>
                <h1>PRODUCTIVITY</h1>
            </div>
            <div className='rightPanel panel'>
                <ExtensionApp />
            </div>
        </div>)
    }
}

export default FOCUS;