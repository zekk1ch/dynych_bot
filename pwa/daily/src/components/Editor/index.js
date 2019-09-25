import React from 'react';
import PropTypes from 'react-proptypes';
import Slidable from './Slidable';
import Controls from './Controls';

const Editor = (props) => (
    <Slidable
        isShown={props.isShown}
        setIsShown={props.setIsShown}
    >
        <Controls
        />
    </Slidable>
);

export default Editor;

Editor.propTypes = {
    isShown: PropTypes.bool.isRequired,
    setIsShown: PropTypes.func.isRequired,
};
