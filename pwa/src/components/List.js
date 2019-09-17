import React, {
    useRef,
    useEffect,
} from 'react';
import PropTypes from 'react-proptypes';
import Note from './Note';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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

    const noteIdsThatStartNewDay = props.notes
        .filter((() => {
            let lastDate;

            return (note, i, arr) => {
                const currDate = new Date(note.timestamp);
                const isFirstNote = i === arr.length - 1;
                const isSameDay = !lastDate || lastDate.getDate() === currDate.getDate() || lastDate.getTime() - note.timestamp > 86400000;

                if (isFirstNote || !isSameDay) {
                    lastDate = currDate;
                    return true;
                }

                return false;
            };
        })())
        .map((note) => note.id);

    return (
        <div className="list" ref={list}>
            {props.notes.map((note) => (
                <React.Fragment key={note.id}>
                    <Note
                        deleteNote={() => props.deleteNote(note.id)}
                        isTouchScreen={props.isTouchScreen}
                        {...note}
                    />
                    {noteIdsThatStartNewDay.includes(note.id) && (
                        <div className="list-date-delimiter">
                            <FontAwesomeIcon icon="chevron-up"/>
                            <p>{new Date(note.timestamp).toLocaleDateString()}</p>
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default List;

List.propTypes = {
    notes: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        timestamp: PropTypes.number,
    })).isRequired,
    deleteNote: PropTypes.func.isRequired,
    isTouchScreen: PropTypes.bool.isRequired,
};
