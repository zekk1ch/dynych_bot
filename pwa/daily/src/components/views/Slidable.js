import React from 'react';
import PropTypes from 'react-proptypes';

class Slidable extends React.Component {
    state = {
        offset: 0,
        isSliding: false,
        isSlidingX: true,
    };

    handleTouchStart = (e) => {
        this.initialClientX = e.touches[0].clientX;
        this.initialClientY = e.touches[0].clientY;
    };
    handleTouchMove = (e) => {
        const { clientX, clientY } = e.touches[0];
        let state = {
            isSlidingX: this.state.isSlidingX,
        };

        if (!this.state.isSliding) {
            const diffX = Math.abs(this.initialClientX - clientX);
            const diffY = Math.abs(this.initialClientY - clientY);
            if (diffX === diffY) {
                return;
            }

            if (diffX > diffY) {
                this.initialOffset = e.currentTarget.offsetLeft;
                this.pointerOffset = clientX;
                this.size = e.currentTarget.offsetWidth;
            } else {
                this.initialOffset = e.currentTarget.offsetTop;
                this.pointerOffset = clientY;
                this.size = e.currentTarget.offsetHeight;
            }
            this.itemSize = this.size / this.children.length;

            state.isSliding = true;
            state.isSlidingX = diffX > diffY;
        }

        state.offset = this.initialOffset + (state.isSlidingX ? clientX : clientY) - this.pointerOffset;

        if (state.offset >= 0) {
            state.offset -= state.offset / 1.1;
        } else {
            const overflow = -1 * state.offset + this.itemSize - this.size;
            if (overflow > 0) {
                state.offset += overflow / 1.1;
            }
        }

        const center = state.offset + this.itemSize / 2;
        const i = Math.ceil(-1 * center / this.itemSize);
        this.props.setIndex(i);

        this.setState(state);
    };
    handleTouchEnd = (e) => {
        this.setState({
            isSliding: false,
        });
    };

    get children() {
        if (!Array.isArray(this.props.children)) {
            return [this.props.children];
        }

        return this.props.children;
    }
    get className() {
        let className = 'slidable';

        if (this.state.isSlidingX) {
            className += ' x';
        } else {
            className += ' y';
        }
        if (this.state.isSliding) {
            className += ' is-sliding';
        }

        return className;
    }
    get style() {
        let style = {};

        const size = `${this.children.length * 100}%`;
        const offset = this.state.isSliding ? `${this.state.offset}px` : `${-1 * this.props.currentIndex * 100}%`;

        if (this.state.isSlidingX) {
            style.width = size;
            style.left = offset;
        } else {
            style.height = size;
            style.top = offset;
        }

        return style;
    }
    get itemStyle() {
        const size = `${100 / this.children.length}%`;

        if (this.state.isSlidingX) {
            return { width: size };
        } else {
            return { height: size };
        }
    }

    render() {
        return (
            <div
                className={this.className}
                style={this.style}
                onTouchStart={this.handleTouchStart}
                onTouchMove={this.handleTouchMove}
                onTouchEnd={this.handleTouchEnd}
            >
                {this.children.map((node, i) => (
                    <div key={i} className="slidable-item" style={this.itemStyle}>
                        {node}
                    </div>
                ))}
            </div>
        );
    }
}

export default Slidable;

Slidable.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node),
    ]).isRequired,
    currentIndex: PropTypes.number.isRequired,
    setIndex: PropTypes.func.isRequired,
};
