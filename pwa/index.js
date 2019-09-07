import './src/scss/index.scss';
import './src/fontAwesomeLibrary';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './src/components/App';

ReactDOM.render(
    <App/>,
    document.getElementById('root'),
);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            await navigator.serviceWorker.register('./sw.js');
        } catch (err) {
            console.log('SW registration failed');
            console.error(err);
        }
    });
}
