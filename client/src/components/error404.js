import React, {Component} from 'react'
import errorGIF from './assets/images/error404.gif'
class Error404 extends Component
{
    render()
    {
        return(
            <div align='center'>
                <img src={errorGIF} alt='WOW, GIF also not found!'/>
                <h1>
                    ERROR 404<br/>
                    Page Not Found
                </h1>
            </div>
        )
    }
}

export default Error404;