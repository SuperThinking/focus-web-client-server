import React, {Component} from 'react'
class Error404 extends Component
{

    render()
    {
        return(
            <div>
                {this.props.history.push("/")}
            </div>
        )
    }
}

export default Error404;