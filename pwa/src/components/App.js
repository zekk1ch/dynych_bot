import React from 'react';
import List from './List';
import Controls from './Controls';
import AddNote from './AddNote';

class App extends React.Component {
    state = {
        notes: [],
        isShowingAddNote: true,
    };
    isTouchScreen = ('ontouchstart' in window);

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
        this.setState({
            notes: this.state.notes.filter((note) => note.id !== id),
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
