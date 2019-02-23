import React, { Component } from 'react';
import './App.css';
import {Route, BrowserRouter, Switch} from 'react-router-dom';
import Home from './components/home'
import Login from './components/login'
import Error404 from './components/error404'
class App extends Component {

  render() {
    return (
      <BrowserRouter>
      <Switch>
        <Route exact path='/' component={Home}/>
        <Route path='/login' component={Login}/>
        <Route component={Error404}/>
      </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
