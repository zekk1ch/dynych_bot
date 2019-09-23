import React from 'react';
import PropTypes from 'react-proptypes';

class Day extends React.Component {
    render() {
        return (
            <div className="month-date">
                <p>{this.props.displayText}</p>
            </div>
        );
    }
}

export default Day;

Day.propTypes = {
    displayText: PropTypes.string.isRequired,
    data: PropTypes.shape({
        id: PropTypes.number,
    }),
};
