import React, { Component } from 'react';
import './styles/dashboard.css'

const options = {
    "Set Limits": "setlimit",
    "History": "history",
    "Today's Quota": "quotaLeft"
};

class Dashboard extends Component {
    render() {
        var dashboardItems = Object.keys(options).map(x => {
            return <div key={options[x]} className='DheaderItems'><button className='dItems'>{x}</button></div>
        });
        return (
            <div className='mainDashboard'>
                <div className='dashboardHeader'>
                    {/* <div className='DheaderItems'><h2>DASHBOARD</h2></div> */}
                    <div className='DheaderItems'><h2>{this.props.unique_id}</h2></div>
                    {dashboardItems}
                </div>
                <div className='dashboardBody'>
                    DIFFERENT STUFF
                </div>
            </div>
        )
    }
}
export default Dashboard;