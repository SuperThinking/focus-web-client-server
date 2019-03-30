import React, { Component } from 'react';
import Axios from 'axios';
import loader from '../assets/images/loader.gif'

class QuotaLeft extends Component {
    state = {
        data: {},
        msgB: 1
    }
    componentDidMount() {
        this.setState({msgB:1});
        const data = {
            'id': this.props.unique_id,
            'today': true
        }
        Axios.post('/api/getuserhistory', data).then((response) => {
            this.setState({msgB:0});
            console.log(response.data.data);
            this.setState({ data: response.data.data });
        });
    }
    render() {
        var timeLeftMessage = Object.keys(this.state.data).map(x => {
            if ('limit' in this.state.data[x][0]) {
                return <div key={x}>{(this.state.data[x][0].limit - this.state.data[x][0].used)} minutes left for {x}</div>;
            }
            else {
                return <div key={x}>{(this.state.data[x][0].used)} minutes spent in Productivity</div>;
            }
        });

        return (
            <div className='quotaWrapper'>
                <h1>Quota Left</h1>
                <div>
                    {
                        (this.state.msgB) ? <img className='loadingSpinner' src={loader} alt="Loading.." /> : (Object.keys(this.state.data).length) ? <h2>{timeLeftMessage}</h2> : <h2>No Activity Found Today</h2>
                    }
                </div>
            </div>
        )
    }
}

export default QuotaLeft;