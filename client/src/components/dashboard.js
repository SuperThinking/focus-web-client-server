import React, { Component } from 'react';
import './styles/dashboard.css'
import SetLimit from './dashboard_items/setlimit';
import UserHistory from './dashboard_items/history';
import QuotaLeft from './dashboard_items/quotaleft';

const options = {
    "Set Limits": 0,
    "History": 1,
    "Quota Left": 2
};

class Dashboard extends Component {

    state = {
        index: 0
    }
    handleClick = e => {
        this.setState({ index: options[e.target.innerHTML]});
    }

    render() {
        var dashboardItems = Object.keys(options).map(x => {
            return <div onClick={this.handleClick} key={options[x]} className={(options[x]===this.state.index)?'DheaderItems dItems selectedItem':'DheaderItems dItems'}>{x}</div>
        });
        const currentComponent = [<SetLimit unique_id={this.props.unique_id} />, <UserHistory unique_id={this.props.unique_id} />, <QuotaLeft unique_id={this.props.unique_id} />];

        return (
            <div className='mainDashboard'>
                <div className='dashboardHeader'>
                    {/* <div className='DheaderItems'><h2>DASHBOARD</h2></div> */}
                    <div className='DheaderItems idHeaderItem'><h2 className='idDisplay'>{localStorage.getItem('username')}</h2></div>
                    {dashboardItems}
                </div>
                <div className='dashboardBody'>
                    {currentComponent[this.state.index]}
                </div>
            </div>
        )
    }
}
export default Dashboard;