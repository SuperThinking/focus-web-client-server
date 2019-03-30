import React, {Component} from 'react';
import extensionExample from './assets/images/extensionExample.png'
class ExtensionApp extends Component{
    render()
    {
        return(<div className='extensionApp'>
            <h1>Install the <a href='https://github.com/XMIRTUNJAY/focus-extension'>FOCUS</a> Chrome Extension</h1>
            <img className='extensionImg' src={extensionExample} alt="Chrome Extension"/>
            <h1>Download the <a href='#LinkToApp'>Android App</a></h1>
        </div>)
    }
}

export default ExtensionApp;