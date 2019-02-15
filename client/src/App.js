import React, { Component } from 'react';
import './App.css';
import Axios from 'axios';
class App extends Component {

  state = {
    website:''
  }

  myRef = React.createRef();

  fetchGenre = (e)=>{
    const data = {"url":this.state.website};
    Axios.post('/insert', data).then(res=>{
      return res.data;
    })
    .then((data)=>{
      console.log(data);
      var category = data.message;
      this.divElement.innerHTML = category;
    });
  }

  render() {
    return (
      <div>
        <h1 align='center'>FOCUS</h1>
        <div id='main-div'>
          <input type='text' value={this.state.website} onChange = {(event)=>this.setState({website:event.target.value})} />
          <br/>
          <button onClick={this.fetchGenre}>Get Category</button>
          <div id='abc' ref={ (divElement) => this.divElement = divElement} align='center'></div>
        </div>
      </div>
    );
  }
}

export default App;
