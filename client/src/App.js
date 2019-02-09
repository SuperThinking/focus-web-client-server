import React, { Component } from 'react';
import './App.css';
import Axios from 'axios';
class App extends Component {

  componentDidMount()
  {
    const data = {"url":"https://www.miniclip.com/games/en/"};
    Axios.post('/insert', data).then(res=>{
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
