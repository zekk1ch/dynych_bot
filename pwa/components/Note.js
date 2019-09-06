import React from 'react';
import PropTypes from 'react-proptypes';

class Note extends React.Component {
    state = {
        left: 0,
        right: 0,
        offset: 0,
        isSliding: false,
        isDeleted: false,
    };
    cursorOffset = 0;

    componentDidMount() {
        this.setDimensions();
        window.addEventListener('resize', this.handleResize);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    setDimensions = () => {
        const ref = document.getElementById(this.props.id);
        const {
            left,
            right,
        } = ref.getBoundingClientRect();

        this.setState({
            left,
            right,
        });
    };
    startSliding = () => {
        if (this.props.isTouchScreen) {
            window.addEventListener('touchmove', this.handleTouchMove);
            window.addEventListener('touchend', this.handleTouchEnd);
        } else {
            window.addEventListener('mousemove', this.handleMouseMove);
            window.addEventListener('mouseup', this.handleMouseUp);
        }

        this.setState({
            isSliding: true,
        });
    };
    stopSliding = () => {
        if (this.props.isTouchScreen) {
            window.removeEventListener('touchmove', this.handleTouchMove);
            window.removeEventListener('touchend', this.handleTouchEnd);
        } else {
            window.removeEventListener('mousemove', this.handleMouseMove);
            window.removeEventListener('mouseup', this.handleMouseUp);
        }

        let state = {
            isSliding: false,
        };
        if (this.offsetIndex > 0.25) {
            state.offset = this.state.right * Math.sign(this.state.offset);
            state.isDeleted = true;
            setTimeout(() => {
                this.props.deleteNote();
            }, 400);
        } else {
            state.offset = 0;
        }
        this.setState(state);
    };
    slide = (offset) => {
        this.setState({
            offset,
        });
    };

    handleResize = (e) => {
        this.setDimensions();
    };
    handleMouseDown = (e) => {
        this.cursorOffset = e.clientX - this.state.left;
        this.startSliding();
    };
    handleMouseMove = (e) => {
        const offset = (e.clientX - this.cursorOffset) - this.state.left;
        this.slide(offset);
    };
    handleMouseUp = (e) => {
        this.stopSliding();
    };
    handleTouchStart = (e) => {
        this.cursorOffset = e.touches[0].clientX - this.state.left;
        this.startSliding();
    };
    handleTouchMove = (e) => {
        const offset = (e.touches[0].clientX - this.cursorOffset) - this.state.left;
        this.slide(offset);
    };
    handleTouchEnd = (e) => {
        this.stopSliding();
    };

    get className() {
        let className = 'note';
        if (this.state.offset !== 0) {
            className += ' sliding';
        }
        if (this.state.isDeleted) {
            className += ' deleted';
        }
        if (this.state.right !== 0) {
            className += ' created';
        }

        return className;
    }
    get width() {
        return this.state.right - this.state.left;
    }
    get offsetIndex() {
        return Math.abs(this.state.offset) / this.width;
    }
    get style() {
        if (this.state.offset === 0) {
            return null;
        }

        let opacity = 1.1 - this.offsetIndex;
        if (opacity > 0.8) {
            opacity = 0.8;
        }

        return {
            marginLeft: this.state.offset,
            opacity,
        };
    }

    render() {
        return (
            <div id={this.props.id}
                 className={this.className}
                 style={this.style}
                 onMouseDown={(!this.props.isTouchScreen || null) && this.handleMouseDown}
                 onTouchStart={(this.props.isTouchScreen || null) && this.handleTouchStart}
            >
                <div className="note-content">
                    <div className="note-text">
                        {this.props.text}
                    </div>
                </div>
            </div>
        );
    }
}

export default Note;

Note.propTypes = {
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    deleteNote: PropTypes.func.isRequired,
    isTouchScreen: PropTypes.bool.isRequired,
};
