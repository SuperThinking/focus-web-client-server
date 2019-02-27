import React, { Component } from 'react'
import '../App.css';
import Axios from 'axios';
import './styles/home.css'
import FOCUS from './focus';

class Home extends Component {
    state = {
        website: ''
    }

    fetchGenre = (e) => {
        const data = { "url": this.state.website, "id": this.props.unique_id };
        Axios.post('/api/insert', data).then(res => {
            return res.data;
        })
        .then((data) => {
            console.log(data);
            var category = data.message;
            this.divElement.innerHTML = category;
        });
    }

    componentDidUpdate(pp, ps){
        console.log(this.props.isAuthenticated);
    }

    render() {
        var yes = <div>
        <h1 align='center'>FOCUS</h1>
        <div id="main-div">
            USER ID => {this.props.unique_id}
            <input type='text' value={this.state.website} onChange={(event) => this.setState({ website: event.target.value })} />
            <br />
            <button onClick={this.fetchGenre}>Get Category</button>
            <div id='abc' ref={(divElement) => this.divElement = divElement} align='center'></div>
        </div>
        </div>;

        return (
            <div>
                {(this.props.isAuthenticated)?yes:<FOCUS/>}
            </div>
        )
    }
}

export default Home;