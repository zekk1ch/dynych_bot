import React, {
    useState,
    useRef,
    useEffect,
} from 'react';
import PropTypes from 'react-proptypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const AddNote = (props) => {
    const input = useRef(null);
    useEffect(() => {
        if (!props.isHidden) {
            input.current.focus();
        }
    });
    const [text, setText] = useState('');
    const submit = () => {
        props.addNote(text);
        setText('');

    };
    const handleKeyDown = (e) => {
        if (e.keyCode === 13 && text.length > 0) {
            e.preventDefault();
            submit();
        }
    };
    const handleChange = (e) => {
        setText(e.target.value);
    };
    const handleClick = (e) => {
        if (text.length > 0) {
            submit();
        } else {
            input.current.focus();
        }
    };

    return (
        <div className={`add-note${props.isHidden ? ' hidden' : ''}`}>
            <div className="add-note-content">
                <input
                    value={text}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter text..."
                    tabIndex={1}
                    ref={input}
                />
                <div
                    className={`add-note-submit${text.length === 0 ? ' disabled' : ''}`}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    tabIndex={2}
                >
                    <FontAwesomeIcon icon="check"/>
                </div>
            </div>
        </div>
    );
};

export default AddNote;

AddNote.propTypes = {
    addNote: PropTypes.func.isRequired,
    isHidden: PropTypes.bool.isRequired,
};
