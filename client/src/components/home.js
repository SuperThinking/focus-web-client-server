import React, { Component } from 'react'
import '../App.css';
import Axios from 'axios';
import './styles/home.css'

class Home extends Component {
    state = {
        website: ''
    }

    myRef = React.createRef();

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
                {(this.props.isAuthenticated)?yes:"NO"}
            </div>
        )
    }
}

export default Home;