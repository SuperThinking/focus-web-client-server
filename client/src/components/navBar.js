import React, {Component} from 'react';
import './styles/navbar.css';
class NavBar extends Component
{
    render()
    {
        return(<div className='mainNavBar'>
            <div className='webHeading'>
                <h1 className='webHeadingText'>FOCUS</h1>
            </div>
            <div className='loginSignup'>
                <button className='navButtons'>Signup</button>
                <button className='navButtons'>Login</button>
            </div>
        </div>);
    }
}

export default NavBar;