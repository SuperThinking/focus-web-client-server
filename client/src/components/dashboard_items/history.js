import React, { Component } from 'react';
import Axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

class UserHistory extends Component {
    state = {
        startDate: '',
        endDate: '',
        gamingData: [],
        tvData: [],
        socialData: [],
        productiveData: [],
        othersData: []
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
            console.log(response.data);
            this.setState({
                gamingData: (response.data.data['gaming'] || []),
                tvData: (response.data.data['onlinetv'] || []),
                socialData: (response.data.data['socialmedia'] || []),
                productiveData: (response.data.data['productivity'] || []),
                othersData: (response.data.data['others'] || [])
            })
        })
    }
    render() {
        const data = [["Gaming", this.state.gamingData],
        ["Online TV", this.state.tvData],
        ["Social Media", this.state.socialData],
        ["Others", this.state.othersData]
        ];
        var graphs = data.map(x => {
            if (x.length && x[1].length) {
                return (
                    <div key={x[0]}>
                        <h2>{x[0]}</h2>
                        <LineChart
                            width={1000}
                            height={300}
                            data={x[1]}
                            margin={{
                                top: 5, right: 30, left: 20, bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="limit" stroke="#c72a2a" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="used" stroke="#3d5fbb" />
                        </LineChart>
                    </div>
                )
            }
        })
        return (
            <div className='setHistoryWrapper'>
                <h1>User History</h1>
                <table>
                    <tbody>
                        <tr><td>Start Date</td><td>End Date</td></tr>
                        <tr>
                            <td><input className='dateInput' onChange={this.handleChange} name='startDate' type='date' value={this.state.startDate}></input></td>
                            <td><input className='dateInput' onChange={this.handleChange} name='endDate' type='date' value={this.state.endDate}></input></td>
                            <td><input type='submit' onClick={this.onClick} value='Submit' className='getHistoryButton'/></td>
                        </tr>
                    </tbody>
                </table>
                {graphs}
            </div>
        )
    }
}

export default UserHistory;