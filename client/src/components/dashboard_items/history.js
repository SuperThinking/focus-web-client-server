import React, { Component } from 'react';
import Axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

class UserHistory extends Component {
    state = {
        startDate: '',
        endDate: '',
        data: [{ date: "2019-03-15T05:10:12.850Z", limits: 60, used: 60 }, { date: "2019-03-13T18:30:00.000Z", limits: 60, used: 15 }]
    }
    handleChange = e => this.setState({ [e.target.name]: e.target.value });
    onClick = e => {
        e.preventDefault();
        const data = {
            'id': this.props.unique_id,
            'start': new Date(this.state.startDate).getTime(),
            'end': new Date(this.state.endDate).getTime()
        }
        Axios.post('/api/getuserhistory', data).then((response) => {
            console.log(response);
            this.setState({ data: response.data })
        })
    }
    render() {
        const data = this.state.data;
        return (
            <div>
                <input onChange={this.handleChange} name='startDate' type='date' value={this.state.startDate}></input>
                <input onChange={this.handleChange} name='endDate' type='date' value={this.state.endDate}></input>
                <input type='submit' onClick={this.onClick} value='Submit' />
                <LineChart
                    width={1000}
                    height={300}
                    data={data}
                    margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="limits" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="used" stroke="#82ca9d" />
                </LineChart>
            </div>
        )
    }
}

export default UserHistory;