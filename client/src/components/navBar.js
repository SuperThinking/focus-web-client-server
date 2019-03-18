import React, {Component} from 'react';
import './styles/navbar.css';
class NavBar extends Component
{
    handleClick = (e)=>{
        if(e.target.innerHTML.toLowerCase()==='focus')
            this.props.p.internalRouting('initial');
        else if(e.target.innerHTML.toLowerCase()==='logout')
            this.props.p.handleLogout();
        else
            this.props.p.internalRouting(e.target.innerHTML.toLowerCase());
    }
    render()
    {
        var loginSignup = <div className='loginSignup'>
                            <button onClick={this.handleClick} className='navButtons'>Signup</button>
                            <button onClick={this.handleClick} className='navButtons'>Login</button>
                        </div>;
        var logout = <div className='logout loginSignup'>
                        <button onClick={this.handleClick} className='navButtons navLogout'>Logout</button>
                    </div>
        return(<div className='mainNavBar'>
            <div className='webHeading'>
                <h1 onClick={this.handleClick} className='webHeadingText'>FOCUS</h1>
            </div>
            {this.props.p.isAuthenticated?logout:loginSignup}
        </div>);
    }
}

export default NavBar;