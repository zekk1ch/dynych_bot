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

        if (!this.state.isSliding) {
            const diffX = Math.abs(this.initialClientX - clientX);
            const diffY = Math.abs(this.initialClientY - clientY);
            if (diffX === diffY) {
                return;
            }

            const isSlidingX = diffX > diffY;
            if (this.state.isSlidingX !== isSlidingX) {
                return this.setState({
                    isSlidingX,
                });
            }

            this.initialOffset = isSlidingX ? e.currentTarget.offsetLeft : e.currentTarget.offsetTop;
            this.pointerOffset = isSlidingX ? clientX : clientY;
        }

        const size = this.state.isSlidingX ? e.currentTarget.offsetWidth : e.currentTarget.offsetHeight;
        const itemSize = size / this.children.length;

        let offset = this.initialOffset + (this.state.isSlidingX ? clientX : clientY) - this.pointerOffset;

        const center = offset + itemSize / 2;
        const i = Math.ceil(-1 * center / itemSize);
        if (i >= 0 && i < this.children.length && i !== this.props.currentIndex) {
            this.props.setIndex(i);
        }

        if (offset >= 0) {
            offset -= offset / 1.1;
        } else {
            const overflow = -1 * offset + itemSize - size;
            if (overflow > 0) {
                offset += overflow / 1.1;
            }
        }

        this.setState({
            isSliding: true,
            offset,
        });
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
