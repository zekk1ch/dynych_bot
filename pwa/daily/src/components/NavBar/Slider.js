import React from 'react';
import PropTypes from 'react-proptypes';

class Slider extends React.Component {
    state = {
        offset: 0,
        isDragging: false,
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.offset !== prevProps.offset) {
            if (this.state.isDragging) {
                this.initialOffset = this.maxWidth * this.props.offset;
            } else {
                this.setState({
                    offset: this.props.offsetLeft,
                });
            }
        }
    }

    handleTouchStart = (e) => {
        const offset = e.target.offsetLeft;
        const width = e.target.offsetWidth;
        const parentWidth = e.target.offsetParent.offsetWidth;

        this.width = width;
        this.maxWidth = parentWidth;
        this.maxOffset = parentWidth - width;
        this.initialOffset = offset;
        this.pointerOffset = e.touches[0].clientX - offset;

        this.setState({
            isDragging: true,
            offset,
        });
    };
    handleTouchMove = (e) => {
        let offset = e.touches[0].clientX - this.pointerOffset;
        if (offset < 0) {
            offset = 0;
        } else if (offset > this.maxOffset) {
            offset = this.maxOffset;
        }

        this.setState({
            offset,
        });

        const center = offset + this.width / 2;
        if (center < this.initialOffset || center > (this.initialOffset + this.width)) {
            const percents = offset / this.maxWidth * 100;
            this.props.handleOffsetChange(percents);
        }
    };
    handleTouchEnd = (e) => {
        this.setState({
            isDragging: false,
        });
    };

    get className() {
        let className = 'slider';

        if (this.state.isDragging) {
            className += ' is-dragging';
        }

        return className;
    }
    get style() {
        let marginLeft;
        if (this.state.isDragging) {
            marginLeft = `${this.state.offset}px`;
        } else {
            marginLeft = `${this.props.offset}%`;
        }

        return {
            width: `${this.props.width}%`,
            marginLeft,
        };
    }

    render() {
        return (
            <div
                className={this.className}
                style={this.style}
                onTouchStart={this.handleTouchStart}
                onTouchMove={this.handleTouchMove}
                onTouchEnd={this.handleTouchEnd}
            />
        );
    }
}

export default Slider;

Slider.propTypes = {
    width: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    handleOffsetChange: PropTypes.func.isRequired,
};
