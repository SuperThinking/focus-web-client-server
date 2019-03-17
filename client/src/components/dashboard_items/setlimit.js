import React, { Component } from 'react';
import Axios from 'axios';

class SetLimit extends Component {

    state = {
        gaminglimit: -1,
        tvlimit: -1,
        medialimit: -1,
        others: -1
    }
    componentDidMount() {
        var data = { 'id': this.props.unique_id };
        Axios.post('/api/getuserlimit', data).then((response) => {
            if (response.data.status)
                this.setState({
                    gaminglimit: response.data.gaming,
                    tvlimit: response.data.onlinetv,
                    medialimit: response.data.socialmedia,
                    others: response.data.others
                })
        })
    }

    handleChange = e => this.setState({ [e.target.name]: e.target.value });

    handleClick = e => {
        if (window.confirm('Are you sure you want to set/change the limits?')) {
            var data = { 'id': this.props.unique_id, 'gaming': this.state.gaminglimit, 'onlinetv': this.state.tvlimit, 'socialmedia': this.state.medialimit, 'others': this.state.others };
            Axios.post('/api/modifylimit', data).then((response) => {
                if (response.data.status)
                    alert(response.data.value);
                else
                    alert(response.data.value);
            })
        }
    }

    render() {
        return (
            <div className='setLimitWrapper'>
                <h1>
                    Set the Limit for each category: <span className='hint'>(set -1 if no limit has to be set)</span>
                </h1>
                <div>
                    <div className='parentCategory'>
                        <h2>Entertainment</h2>
                    </div>
                    <div className='childCategory'>
                        <table>
                            <tbody>
                                <tr>
                                    <td className='childItem'>Gaming</td>
                                    <td>:</td>
                                    <td><input onChange={this.handleChange} type='number' className='limitInput' name='gaminglimit' value={this.state.gaminglimit} /></td>
                                    <td>minutes</td>
                                </tr>
                                <tr>
                                    <td className='childItem'>Online TV</td>
                                    <td>:</td>
                                    <td><input onChange={this.handleChange} type='number' className='limitInput' name='tvlimit' value={this.state.tvlimit} /></td>
                                    <td>minutes</td>
                                </tr>
                                <tr>
                                    <td className='childItem'>Social Media</td>
                                    <td>:</td>
                                    <td><input onChange={this.handleChange} type='number' className='limitInput' name='medialimit' value={this.state.medialimit} /></td>
                                    <td>minutes</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <div className='parentCategory'>
                        <h2>Others (e.g. E-Commerce)</h2>
                        <table>
                            <tbody>
                                <tr>
                                    <td className='childItem'>Others</td>
                                    <td>:</td>
                                    <td><input onChange={this.handleChange} type='number' className='limitInput' name='others' value={this.state.others} /></td>
                                    <td>minutes</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <button onClick={this.handleClick} className='setLimitButton'>Set Limit</button>
            </div>
        )
    }
}

export default SetLimit;