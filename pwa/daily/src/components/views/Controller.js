import React from 'react';
import PropTypes from 'react-proptypes';

class Controller extends React.Component {
    get viewSpace() {
        return 5;
    }
    get viewStyle() {
        return {
            marginRight: `${this.viewSpace}vw`,
        };
    }
    get style() {
        const offset = -1 * (this.props.currentView * 100 + this.props.currentView * this.viewSpace);

        return {
            marginLeft: `${offset}vw`,
        };
    }

    render() {
        return (
            <div className="view-controller" style={this.style}>
                {this.props.children.map((View, i) => (
                    <div
                        key={i}
                        className={`view-wrapper${this.props.currentView === i ? ' selected' : ''}`}
                        style={this.viewStyle}
                    >
                        {View}
                    </div>
                ))}
            </div>
        );
    }
}

export default Controller;

Controller.propTypes = {
    currentView: PropTypes.number.isRequired,
};
