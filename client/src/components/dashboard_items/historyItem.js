import React, { Component } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

class HistoryItem extends Component {

    state = {
        flag: 1,
        isMobile: false
    }


    onWindowResize = () => {
        console.log("Resized "+ window.innerWidth)
        this.setState({ isMobile: window.innerWidth < 767 });
    }

    componentDidMount() {
        window.addEventListener('resize', this.onWindowResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowResize);
    }


    shbody = e => {
        if (this.state.flag) {
            this.setState({ flag: 0 });
            document.getElementById(e.target.id + "body").style.display = 'inherit';
        }
        else {
            this.setState({ flag: 1 });
            document.getElementById(e.target.id + "body").style.display = 'none';
        }
    }

    render() {
        var x = this.props.x;
        const { isMobile } = this.state;
        const showItems = isMobile ? 300 : 1000;
        return (
            <div>
                <h2 className='historyHeader' id={x[0]} onClick={this.shbody}>{x[0] + "⇒"}</h2>
                <div id={x[0] + "body"} style={{ display: 'none' }}>
                    <LineChart
                        width={showItems}
                        height={300}
                        data={x[1]}
                        margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="5 5" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line strokeWidth="2" type="monotone" dataKey="limit" stroke="#c72a2a" activeDot={{ r: 8 }} />
                        <Line strokeWidth="2" type="monotone" dataKey="used" stroke="#3d5fbb" />
                    </LineChart>
                </div>
            </div>
        )
    }
}

export default HistoryItem;