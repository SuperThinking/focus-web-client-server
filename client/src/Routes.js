import React, {Component} from 'react';
import {Route, BrowserRouter, Switch} from 'react-router-dom';
import Home from './components/home'
import Error404 from './components/error404'
import AppliedRoute from './components/AppliedRoute'

class Routes extends Component {
    render() {
        return(
            <BrowserRouter>
                <Switch>
                    <AppliedRoute path="/" exact component={Home} props={this.props.childProps} />
                    <Route component={Error404} />
                </Switch>
            </BrowserRouter>
        );
    }
}
export default Routes;