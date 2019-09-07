import React from 'react';
import PropTypes from 'react-proptypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Controls = (props) => (
    <div className="controls">
        <div className="controls-control" onClick={props.toggleIsShowingAddNote}>
            <p>{props.isShowingAddNote ? 'hide' : 'show'}</p>
            <FontAwesomeIcon icon={[props.isShowingAddNote ? 'far' : 'fas', 'keyboard']}/>
        </div>
    </div>
);

export default Controls;

Controls.propTypes = {
    isShowingAddNote: PropTypes.bool.isRequired,
    toggleIsShowingAddNote: PropTypes.func.isRequired,
};
