import React from 'react';
import PropTypes from 'react-proptypes';
import Slidable from '../Slidable';
import Month from './Month';

class MonthView extends React.Component {
    state = {
        currentMonth: 0,
    };

    setMonth = (i) => {
        this.setState({
            currentMonth: i,
        });
    };

    render() {
        return (
            <div className="view">
                <div className="content">
                    <Slidable currentIndex={this.state.currentMonth} setIndex={this.setMonth}>
                    </Slidable>
                </div>
            </div>
        );
    }
}

export default MonthView;

MonthView.propTypes = {
};
