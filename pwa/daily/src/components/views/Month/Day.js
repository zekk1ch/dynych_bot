import React from 'react';
import PropTypes from 'react-proptypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class Day extends React.Component {
    get circleStyle() {
        const total = this.props.checks.reduce((acc, curr) => {
            switch (curr) {
                case false:
                    return acc + 1;
                case null:
                    return acc + 0.25;
                default:
                    return acc;
            }
        }, 0);
        const index = total / this.props.checks.length;
        const pigment = 240 - Math.round(index * 36);
        const backgroundColor = `#${pigment.toString(16).repeat(3)}`;

        return {
            backgroundColor,
        };
    }

    render() {
        return (
            <div className="month-date">
                <div className="circle" onClick={this.props.handleClick} style={this.circleStyle}>
                    <p>{this.props.displayText}</p>
                </div>
                {!this.props.isInFuture && (
                    <div className="checks">
                        {this.props.checks.map((check, i) => (
                            <div key={i} className="check">
                                {check === null && <FontAwesomeIcon className="pending" icon={['far', 'clock']}/>}
                                {check === true && <FontAwesomeIcon className="ok" icon="check"/>}
                                {check === false && <FontAwesomeIcon className="not-ok" icon="times"/>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
}

export default Day;

Day.propTypes = {
    displayText: PropTypes.string.isRequired,
    isInFuture: PropTypes.bool.isRequired,
    checks: PropTypes.arrayOf(PropTypes.oneOf([null, true, false])).isRequired,
    handleClick: PropTypes.func.isRequired,
};
