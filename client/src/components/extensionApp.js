import React, {Component} from 'react';
import extensionExample from './assets/images/extensionExample.png'
class ExtensionApp extends Component{
    render()
    {
        return(<div className='extensionApp'>
            <h1>Download the Chrome Extension</h1>
            <img class='extensionImg' src={extensionExample} alt="Chrome Extension"/>
            <h1>Download the Android App</h1>
        </div>)
    }
}

export default ExtensionApp;