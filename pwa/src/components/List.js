import React, {
    useRef,
    useEffect,
} from 'react';
import PropTypes from 'react-proptypes';
import Note from './Note';

const List = (props) => {
    const list = useRef(null);
    useEffect(() => {
        if (list.current) {
            list.current.scrollTo(0, 0)
        }
    });

    if (!props.notes.length) {
        return (
            <div className="list list-empty">
                <p>Current list is empty</p>
            </div>
        );
    }

    return (
        <div className="list" ref={list}>
            {props.notes.map((note) => (
                <Note
                    key={note.id}
                    deleteNote={() => props.deleteNote(note.id)}
                    isTouchScreen={props.isTouchScreen}
                    {...note}
                />
            ))}
        </div>
    );
};

export default List;

List.propTypes = {
    notes: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
    })).isRequired,
    deleteNote: PropTypes.func.isRequired,
    isTouchScreen: PropTypes.bool.isRequired,
};
