import React from 'react';
import PropTypes from 'react-proptypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class AddNote extends React.Component {
    state = {
        text: '',
    };
    input = React.createRef();

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.isHidden && !this.props.isHidden) {
            this.input.current.focus();
        }
    }

    submit = () => {
        this.props.saveNote(this.state.text);

        this.setState({
            text: '',
        });
    };

    handleChange = (e) => {
        this.setState({
            text: e.target.value,
        });
    };
    handleKeyDown = (e) => {
        if (e.keyCode === 13 && this.state.text.length > 0) {
            e.preventDefault();
            this.submit();
        }
    };
    handleSubmitClick = (e) => {
        if (this.state.text.length > 0) {
            this.submit();
        }

        this.input.current.focus();
    };
    handlePasteFromClipboardClick = async (e) => {
        try {
            const text = await navigator.clipboard.readText();

            this.setState({
                text,
            });

            this.input.current.focus();
        } catch (err) {
            console.error(err);
        }
    };

    get className() {
        let className = 'add-note';

        if (this.props.isHidden) {
            className += ' hidden';
        }
        if (this.state.text.length === 0) {
            className += ' disabled';
        }

        return className;
    }

    render() {
        return (
            <div className={this.className}>
                <div className="add-note-content">
                    <div className="add-note-controls">
                        {this.props.isClipboardAccessible && (
                            <div className="add-note-control" onClick={this.handlePasteFromClipboardClick}>
                                <FontAwesomeIcon icon={this.props.isDarkMode ? 'clipboard' : ['far', 'clipboard']}/>
                            </div>
                        )}
                    </div>
                    <input
                        value={this.state.text}
                        onChange={this.handleChange}
                        onKeyDown={this.handleKeyDown}
                        placeholder="Enter text..."
                        tabIndex={1}
                        ref={this.input}
                    />
                    <div
                        className="add-note-submit"
                        onClick={this.handleSubmitClick}
                        onKeyDown={this.handleKeyDown}
                        tabIndex={2}
                    >
                        <FontAwesomeIcon icon="check"/>
                    </div>
                </div>
            </div>
        );
    }
}

export default AddNote;

AddNote.propTypes = {
    saveNote: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    isHidden: PropTypes.bool.isRequired,
    isClipboardAccessible: PropTypes.bool.isRequired,
};
