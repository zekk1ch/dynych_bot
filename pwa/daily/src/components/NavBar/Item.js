import React from 'react';
import PropTypes from 'react-proptypes';

class Item extends React.Component {
    get className() {
        let className = 'item';

        if (this.props.isSelected) {
            className += ' selected';
        }

        return className;
    };

    render() {
        return (
            <div
                className={this.className}
                onClick={this.props.handleClick}
            >
                <p>{this.props.text}</p>
            </div>
        );
    }
}

export default Item;

Item.propTypes = {
    text: PropTypes.string.isRequired,
    isSelected: PropTypes.bool.isRequired,
    handleClick: PropTypes.func.isRequired,
};
