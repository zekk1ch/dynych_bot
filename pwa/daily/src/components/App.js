import React from 'react';
import NavBar from './NavBar/';
import Editor from './Editor/';
import ViewController from './views/Controller';
import WeekView from './views/Week/';
import MonthView from './views/Month/';

class App extends React.Component {
    state = {
        currentView: 0,
        dates: [],
        isEditorShown: false,
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

    setIsEditorShown = (value) => {
        this.setState({
            isEditorShown: value,
        });
    };

    get views() {
        return ['Month', 'Week'];
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
                    <MonthView
                        dates={this.state.dates}
                        handleDateClick={() => null}
                    />
                    <WeekView
                    />
                </ViewController>
                <Editor
                    isShown={this.state.isEditorShown}
                    setIsShown={this.setIsEditorShown}
                />
            </div>
        );
    }
}

export default App;
