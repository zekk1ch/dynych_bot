import React from 'react';
import PropTypes from 'react-proptypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Loader = (props) => (
    <div className={`loader${props.isHidden ? ' hidden' : ''}`}>
        <div className="loader-spinner">
            <FontAwesomeIcon className="fa-spin" icon="spinner"/>
        </div>
    </div>
);

export default Loader;

Loader.propTypes = {
    isHidden: PropTypes.bool,
};
