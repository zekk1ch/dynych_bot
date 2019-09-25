import React from 'react';
import PropTypes from 'react-proptypes';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome';

const Controls = (props) => {
    const resetClassName = `control reset${props.isResetHidden ? ' hidden' : ''}`;

    return (
        <div className="controls">
            <div className={resetClassName} onClick={props.reset}>
                <p>Today</p>
                <FontAwesomeIcon icon="undo-alt"/>
            </div>
        </div>
    );
};

export default Controls;

Controls.propTypes = {
    reset: PropTypes.func.isRequired,
    isResetHidden: PropTypes.bool.isRequired,
};
