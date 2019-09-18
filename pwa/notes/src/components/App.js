import React from 'react';
import uuid from 'uuid/v4';
import * as actionTypes from '../../actionTypes';
import * as preferencesKeys from '../../preferencesKeys';
import Loader from './Loader';
import List from './List';
import Controls from './Controls';
import AddNote from './AddNote';

class App extends React.Component {
    state = {
        notes: [],
        isShowingAddNote: true,
        isDarkMode: false,
        isServiceWorkerConnected: false,
        isLoaded: null,
        permissions: {
            clipboard: false,
        },
    };
    isTouchScreen = ('ontouchstart' in window);

    componentDidMount() {
        // TODO: разобраться почему ЭТО работает а обычный setState без setTimeout - нет
        setTimeout(async () => {
            this.setState({
                isLoaded: false,
            });

            this.initPermissions();

            try {
                await this.registerServiceWorker();
            } catch (err) {
                console.error('Failed to register service worker –', new Error(err));
                setTimeout(() => {
                    alert(`Oops...\nCritical error – ${err.message}`);
                });
                return this.setState({
                    isLoaded: true,
                });
            }

            if (navigator.serviceWorker.controller === null) {
                this.setState({
                    isLoaded: true,
                });
                setTimeout(() => {
                    if (confirm('Page needs to be reloaded for the back-end changes to take effect\n\nReload?')) {
                        location.reload();
                    }
                }, 700);
            } else {
                this.setState({
                    isServiceWorkerConnected: true,
                }, async () => {
                    await Promise.all([
                        this.getPreferences(),
                        this.getNotes(),
                    ]);
                    this.setState({
                        isLoaded: true,
                    });
                });
            }
        });
    }

    initPermissions = async () => {
        const isPermissionGranted = (status) => status === 'granted' || status === 'prompt';
        const permissions = {
            'clipboard': 'clipboard-read',
        };
        const promises = Object.keys(permissions)
            .map((stateName) => async () => {
                const permission = await navigator.permissions.query({ name: permissions[stateName] });
                permissions[stateName] = isPermissionGranted(permission.state);
                permission.onchange = (e) => {
                    this.setState({
                        permissions: {
                            [stateName]: isPermissionGranted(e.target.state),
                        },
                    });
                };
            })
            .map((fn) => fn());

        await Promise.all(promises);

        this.setState({
            permissions,
        });
    };
    registerServiceWorker = async () => {
        if (!'serviceWorker' in navigator) {
            throw new Error('Browser doesn\'t support service workers');
        }

        await navigator.serviceWorker.register('/notes/sw.js');
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
    getPreferences = async () => {
        const request = {
            action: actionTypes.GET_PREFERENCES,
        };

        try {
            const preferences = await this.postDataToServiceWorker(request);

            this.setState({
                isShowingAddNote: preferences[preferencesKeys.IS_KEYBOARD_SHOWN],
                isDarkMode: preferences[preferencesKeys.IS_DARK_MODE]
            });
        } catch (err) {
            console.error('Failed to fetch user preferences –', err);
        }
    };
    toggleIsShowingAddNote = async () => {
        const request = {
            action: actionTypes.SET_PREFERENCE,
            data: {
                key: preferencesKeys.IS_KEYBOARD_SHOWN,
                value: !this.state.isShowingAddNote,
            },
        };

        try {
            const isShowingAddNote = await this.postDataToServiceWorker(request);

            this.setState({
                isShowingAddNote,
            });
        } catch (err) {
            console.error('Failed to show/hide keyboard –', err);
        }
    };
    toggleIsDarkMode = async () => {
        const request = {
            action: actionTypes.SET_PREFERENCE,
            data: {
                key: preferencesKeys.IS_DARK_MODE,
                value: !this.state.isDarkMode,
            },
        };

        try {
            const isDarkMode = await this.postDataToServiceWorker(request);

            this.setState({
                isDarkMode,
            });
        } catch (err) {
            console.error('Failed to toggle dark mode –', err);
        }
    };
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
            });

            if (!this.state.notes.length && !this.state.isShowingAddNote) {
                await this.toggleIsShowingAddNote();
            }
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
        if (this.state.isLoaded === null) {
            return <Loader isHidden={true}/>;
        }
        if (!this.state.isLoaded) {
            return <Loader/>;
        }

        return (
            <div className={`app${this.state.isDarkMode ? ' dark' : ''}`}>
                <AddNote
                    saveNote={this.state.isServiceWorkerConnected ? this.saveNote : this.saveNoteMock}
                    isClipboardAccessible={this.state.permissions.clipboard}
                    isDarkMode={this.state.isDarkMode}
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
                    isIsShowingAddNoteToggleHidden={this.state.notes.length === 0}
                    isDarkMode={this.state.isDarkMode}
                    toggleIsDarkMode={this.toggleIsDarkMode}
                    isHidden={false}
                />
            </div>
        );
    }
}

export default App;
