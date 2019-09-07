import './src/scss/index.scss';
import './src/fontAwesomeLibrary';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './src/components/App';
import * as env from '../env';

ReactDOM.render(
    <App/>,
    document.getElementById('root'),
);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const scope = env.MODE === 'production' ? '/todo/' : '/';
            await navigator.serviceWorker.register(`./sw.js?mode=${env.MODE}`, { scope });
        } catch (err) {
            console.error('Failed to register service worker –', err);
        }
    });
}
