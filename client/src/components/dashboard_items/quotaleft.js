import React, { Component } from 'react';
import Axios from 'axios';

class QuotaLeft extends Component {
    state = {
        data: {}
    }
    componentDidMount() {
        const data = {
            'id': this.props.unique_id,
            'today': true
        }
        Axios.post('/api/getuserhistory', data).then((response) => {
            console.log(response.data.data);
            this.setState({ data: response.data.data });
        });
    }
    render() {
        var timeLeftMessage = Object.keys(this.state.data).map(x => {
            console.log(this.state.data[x][0]);
            if ('limits' in this.state.data[x][0]) {
                return <div>{(this.state.data[x][0].limits - this.state.data[x][0].used)} minutes left for {x}</div>;
            }
            else {
                return <div>{(this.state.data[x][0].used)} minutes spent in Productivity</div>;
            }
        });
        // var timeLeftMessage = "asd";
        return (
            <div className='quotaWrapper'>
                <h1>Quota Left</h1>
                <div>
                    {timeLeftMessage}
                </div>
            </div>
        )
    }
}

export default QuotaLeft;