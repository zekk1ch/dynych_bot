import './src/scss/index.scss';
import './src/fontAwesomeLibrary';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './src/components/App';
import * as env from '../../env';

ReactDOM.render(
    <App mode={env.MODE}/>,
    document.getElementById('root'),
);
