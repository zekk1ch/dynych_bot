import React from 'react';
import PropTypes from 'react-proptypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Controls = (props) => {
    const toggleIsShowingAddNoteIcon = props.isShowingAddNote ? ['far', 'keyboard'] : 'keyboard';
    const toggleIsDarkModeIcon = props.isDarkMode ? 'moon' : 'sun';

    return (
        <div className={`controls${props.isHidden ? ' hidden' : ''}`}>
            <div className={`controls-control${props.isIsShowingAddNoteToggleHidden ? ' hidden' : ''}`} onClick={props.toggleIsShowingAddNote}>
                <FontAwesomeIcon icon={toggleIsShowingAddNoteIcon}/>
            </div>
            <div className="controls-control" onClick={props.toggleIsDarkMode}>
                <FontAwesomeIcon icon={toggleIsDarkModeIcon}/>
            </div>
        </div>
    );
};

export default Controls;

Controls.propTypes = {
    isShowingAddNote: PropTypes.bool.isRequired,
    toggleIsShowingAddNote: PropTypes.func.isRequired,
    isIsShowingAddNoteToggleHidden: PropTypes.bool.isRequired,
    toggleIsDarkMode: PropTypes.func.isRequired,
    isHidden: PropTypes.bool.isRequired,
};
