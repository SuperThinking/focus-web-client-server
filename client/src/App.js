import React, { Component } from 'react';
import './App.css';
import Axios from 'axios';
class App extends Component {

  componentDidMount()
  {
    Axios.get('/insert').then(res=>{
      console.log(res);
    });
  }

  render() {
    return (
      <div>
        <h1 align='center'>FOCUS</h1>
      </div>
    );
  }
}

export default App;
