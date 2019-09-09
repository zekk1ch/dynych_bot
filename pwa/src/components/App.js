import React from 'react';
import PropTypes from 'react-proptypes';
import uuid from 'uuid/v4';
import * as actionTypes from '../../actionTypes';
import List from './List';
import Controls from './Controls';
import AddNote from './AddNote';

class App extends React.Component {
    state = {
        notes: [],
        isShowingAddNote: true,
        isServiceWorkerConnected: false,
    };
    isTouchScreen = ('ontouchstart' in window);

    async componentDidMount() {
        try {
            await this.registerServiceWorker(this.props.mode);
        } catch (err) {
            console.error('Failed to register service worker –', err);
            return alert(`Oops...\nCritical error – ${err.message}`);
        }

        if (navigator.serviceWorker.controller === null) {
            if (confirm('Page needs to be reloaded for the back-end changes to take effect\n\nReload?')) {
                setTimeout(() => {
                    location.reload();
                }, 400);
            }
        } else {
            this.setState({
                isServiceWorkerConnected: true,
            }, this.getNotes);
        }
    }

    toggleIsShowingAddNote = () => {
        this.setState({
            isShowingAddNote: !this.state.isShowingAddNote,
        });
    };
    registerServiceWorker = async () => {
        if (!'serviceWorker' in navigator) {
            throw new Error('Browser doesn\'t support service workers');
        }

        const scope = this.props.mode === 'production' ? '/todo/' : '/';
        await navigator.serviceWorker.register(`./sw.js?mode=${this.props.mode}`, { scope });
    };
    postDataToServiceWorker = (data) => new Promise((resolve, reject) => {
        if (!this.state.isServiceWorkerConnected) {
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
    getNotes = async () => {
        const request = {
            action: actionTypes.GET_NOTES,
        };

        try {
            const notes = await this.postDataToServiceWorker(request);

            this.setState({
                notes,
            });
        } catch (err) {
            console.error('Failed to fetch previously saved notes –', err);
        }
    };
    saveNote = async (text) => {
        const request = {
            action: actionTypes.SAVE_NOTE,
            data: {
                id: uuid(),
                text,
                timestamp: Date.now(),
            },
        };

        try {
            const note = await this.postDataToServiceWorker(request);

            this.setState({
                notes: [note].concat(this.state.notes),
            });
        } catch (err) {
            console.error('Failed to save note –', err);
        }
    };
    deleteNote = async (id) => {
        const request = {
            action: actionTypes.DELETE_NOTE,
            data: id,
        };

        try {
            await this.postDataToServiceWorker(request);

            const notes = this.state.notes.filter((note) => note.id !== id);
            this.setState({
                notes,
                isShowingAddNote: this.state.isShowingAddNote || notes.length === 0,
            });
        } catch (err) {
            console.error('Failed to delete note –', err);
        }
    };
    saveNoteMock = (text) => {
        const note = {
            id: uuid(),
            text,
            timestamp: Date.now(),
        };

        this.setState({
            notes: [note].concat(this.state.notes),
        });
    };
    deleteNoteMock = (id) => {
        const notes = this.state.notes.filter((note) => note.id !== id);

        this.setState({
            notes,
            isShowingAddNote: this.state.isShowingAddNote || notes.length === 0,
        });
    };

    render() {
        return (
            <div className="app">
                <AddNote
                    saveNote={this.state.isServiceWorkerConnected ? this.saveNote : this.saveNoteMock}
                    isHidden={!this.state.isShowingAddNote}
                />
                <List
                    notes={this.state.notes}
                    deleteNote={this.state.isServiceWorkerConnected ? this.deleteNote : this.deleteNoteMock}
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
