import React, {Component} from 'react';
import './styles/navbar.css'
class NavBar extends Component
{
    handleLogout = ()=>this.props.handleLogout();

    render()
    {
        var options = this.props.options.map(x=>{
            var cn = x.split(" ").join("").toLowerCase();
            return (x==='Logout')?<button key={cn} onClick={this.handleLogout} className={cn}>{x}</button>:<a href={"/"+cn} key={cn}><button className={cn}>{x}</button></a>
        })
        return(
            <div className='mainNavBar'>
                {options}
            </div>
        )
    }
}

export default NavBar;