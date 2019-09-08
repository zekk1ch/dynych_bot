import React from 'react';
import PropTypes from 'react-proptypes';
import * as actionTypes from '../../actionTypes';
import List from './List';
import Controls from './Controls';
import AddNote from './AddNote';

class App extends React.Component {
    state = {
        notes: [],
        isShowingAddNote: false,
    };
    isTouchScreen = ('ontouchstart' in window);

    async componentDidMount() {
        try {
            await this.registerServiceWorker(this.props.mode);
        } catch (err) {
            console.error('Failed to register service worker –', err);
            return alert(`Oops...\nCritical error – ${err.message}`);
        }

        try {
            const notes = await this.fetchNotes();

            this.setState({
                notes: notes,
                isShowingAddNote: notes.length === 0,
            });
        } catch (err) {
            console.error('Failed to fetch previously saved notes –', err);
            this.setState({
                isShowingAddNote: true,
            });
        }
    }

    registerServiceWorker = async () => {
        if (!'serviceWorker' in navigator) {
            throw new Error('Browser doesn\'t support service workers');
        }

        const scope = this.props.mode === 'production' ? '/todo/' : '/';
        await navigator.serviceWorker.register(`./sw.js?mode=${this.props.mode}`, { scope });
    };
    postDataToServiceWorker = (data) => new Promise((resolve, reject) => {
        if (navigator.serviceWorker.controller === null) {
            reject(new Error('API service worker cannot currently process requests. Refresh the page'));
        }

        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (e) => {
            if (e.data.ok) {
                resolve(e.data.data);
            } else {
                reject(e.data.error);
            }
        };

        navigator.serviceWorker.controller.postMessage(data, [messageChannel.port2]);
    });
    fetchNotes = () => {
        const data = {
            action: actionTypes.GET_NOTES,
        };
        return this.postDataToServiceWorker(data);
    };
    addNote = (text) => {
        // TODO
        const note = {
            id: Math.random().toString(),
            text,
        };

        this.setState({
            notes: [note].concat(this.state.notes),
        });
    };
    deleteNote = (id) => {
        const notes = this.state.notes.filter((note) => note.id !== id);

        this.setState({
            notes,
            isShowingAddNote: this.state.isShowingAddNote || notes.length === 0,
        });
    };
    toggleIsShowingAddNote = () => {
        this.setState({
            isShowingAddNote: !this.state.isShowingAddNote,
        });
    };

    render() {
        return (
            <div className="app">
                <AddNote
                    addNote={this.addNote}
                    isHidden={!this.state.isShowingAddNote}
                />
                <List
                    notes={this.state.notes}
                    deleteNote={this.deleteNote}
                    isTouchScreen={this.isTouchScreen}
                />
                <Controls
                    isShowingAddNote={this.state.isShowingAddNote}
                    toggleIsShowingAddNote={this.toggleIsShowingAddNote}
                    isHidden={this.state.notes.length === 0}
                />
            </div>
        );
    }
}

export default App;

App.propTypes = {
    mode: PropTypes.oneOf([
        'development',
        'production',
    ]).isRequired,
};
