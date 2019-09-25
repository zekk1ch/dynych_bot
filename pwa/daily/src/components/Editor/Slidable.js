import React from 'react';
import PropTypes from 'react-proptypes';

class Slidable extends React.Component {
    state = {
        isDragging: false,
        offset: 0,
        initialHeight: 0,
        initialOffset: 0,
        pointerOffset: 0,
    };
    ref = React.createRef();

    startDragging = (clientY) => {
        let { offsetHeight: initialHeight, offsetTop: initialOffset } = this.ref.current;
        let pointerOffset = 0, offset = 0;

        if (this.props.isShown) {
            initialOffset += 15;
            pointerOffset = clientY - initialOffset;
            if (pointerOffset < 0) {
                pointerOffset = 0;
            }
        } else {
            offset = initialHeight - 20;
            initialOffset -= initialHeight - 35;
        }

        this.setState({
            isDragging: true,
            offset,
            initialHeight,
            initialOffset,
            pointerOffset,
        });
    };
    drag = (clientY) => {
        let offset = -1 * (this.state.initialOffset - clientY + this.state.pointerOffset);

        if (offset > 0) {
            const maxOffset = this.state.initialHeight - 20;
            if (offset > maxOffset) {
                offset = maxOffset;
            }

            this.setState({
                offset,
            });
        } else {
            let pointerOffset = this.state.pointerOffset;
            if (pointerOffset > 0) {
                pointerOffset = clientY - this.state.initialOffset;
                if (pointerOffset < 0) {
                    pointerOffset = 0;
                }
            }

            this.setState({
                offset: 0,
                pointerOffset,
            });
        }
    };
    stopDragging = () => {
        this.setState({
            isDragging: false,
            offset: 0,
        });

        const isShown = Math.round(this.state.offset / this.state.initialHeight) === 0;
        this.props.setIsShown(isShown);
    };

    handleOverlayClick = (e) => {
        this.props.setIsShown(false);
    };
    handleDragTouchStart = (e) => {
        const { clientY } = e.touches[0];

        this.startDragging(clientY);
    };
    handleDragTouchMove = (e) => {
        const { clientY } = e.touches[0];

        this.drag(clientY);
    };
    handleDragTouchEnd = (e) => {
        this.stopDragging();
    };

    get commonClassName() {
        let className = '';

        if (this.state.isDragging) {
            className += ' is-dragging';
        } else if (!this.props.isShown) {
            className += ' hidden'
        }

        return className;
    }
    get style() {
        if (this.state.isDragging) {
            return {
                bottom: -1 * this.state.offset,
            };
        }

        return null;
    }
    get contentStyle() {
        if (this.state.isDragging) {
            return {
                opacity: 1 - this.state.offset / this.state.initialHeight,
            };
        }

        return null;
    }

    render() {
        return (
            <>
                <div
                    className={`editor${this.commonClassName}`}
                    style={this.style}
                    ref={this.ref}
                    onTouchStart={this.handleDragTouchStart}
                    onTouchMove={this.handleDragTouchMove}
                    onTouchEnd={this.handleDragTouchEnd}
                >
                    <div className="editor-handle-placeholder"/>
                    <div className={`editor-handle${this.state.isDragging ? ' selected' : ''}`}/>
                    <div className="editor-content" style={this.contentStyle}>
                        {this.props.children}
                    </div>
                </div>
                <div
                    className={`editor-overlay${this.commonClassName}`}
                    onClick={this.handleOverlayClick}
                    onTouchStart={this.handleDragTouchStart}
                    onTouchMove={this.handleDragTouchMove}
                    onTouchEnd={this.handleDragTouchEnd}
                />
            </>
        )
    }
}

export default Slidable;

Slidable.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node),
    ]),
    isShown: PropTypes.bool.isRequired,
    setIsShown: PropTypes.func.isRequired,
};
