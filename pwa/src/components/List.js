import React from 'react';
import PropTypes from 'react-proptypes';
import Note from './Note';

const List = (props) => {
    if (!props.notes.length) {
        return (
            <div className="list list-empty">
                <p>Current list is empty</p>
            </div>
        );
    }

    return (
        <div className="list">
            {props.notes.map((note, i) => (
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
