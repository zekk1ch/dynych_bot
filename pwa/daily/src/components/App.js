import React from 'react';

class App extends React.Component {
    async componentDidMount() {
        try {
            await this.registerServiceWorker();
        } catch (err) {
            console.error('Failed to register service worker –', new Error(err));
        }
    }

    registerServiceWorker = async () => {
        if (!'serviceWorker' in navigator) {
            throw new Error('Browser doesn\'t support service workers');
        }

        await navigator.serviceWorker.register('/daily/sw.js');
    };

    render() {
        return (
            <div className="app">
            </div>
        );
    }
}

export default App;
