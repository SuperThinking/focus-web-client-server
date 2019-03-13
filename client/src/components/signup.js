import React, { Component } from 'react';

class Signup extends Component {
    render()
    {
        return(
            <div className='lsForm'>
                <div>
                <div className='uniqueInput'>
                    <span className="inputInfo">Name</span>
                    <br />
                    <input type='text' className='loginInput' />
                    <br />
                </div>
                <div className='uniqueInput'>
                    <span className="inputInfo">Username</span>
                    <br />
                    <input type='text' className='loginInput' />
                    <br />
                </div>
                <div className='uniqueInput'>
                    <span className="inputInfo">Email</span>
                    <br />
                    <input type='text' className='loginInput' />
                    <br />
                </div>
                <div className='uniqueInput'>
                    <span className="inputInfo">Password</span>
                    <br />
                    <input type='password' className='loginInput' />
                </div>
                <div className='uniqueInput'>
                    <input type='submit' className='loginButton' value='Submit' />
                </div>
            </div>
            </div>
        )
    }
}

export default Signup;