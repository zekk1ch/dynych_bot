import React from 'react';
import NavBar from './NavBar/';
import ViewController from './views/Controller';
import Week from './views/Week';
import Month from './views/Month';

class App extends React.Component {
    state = {
        currentView: 0,
    };

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
    selectView = (i) => {
        this.setState({
            currentView: i,
        });
    };

    get views() {
        return ['Week', 'Day'];
    }

    render() {
        return (
            <div className="app">
                <NavBar
                    titles={this.views}
                    currentView={this.state.currentView}
                    selectView={this.selectView}
                />
                <ViewController currentView={this.state.currentView}>
                    <Month/>
                    <Week/>
                </ViewController>
            </div>
        );
    }
}

export default App;
