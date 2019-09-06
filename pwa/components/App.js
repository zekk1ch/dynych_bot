import React from 'react';
import List from './List';

class App extends React.Component {
    state = {
        notes: [],
    };
    isTouchScreen = ('ontouchstart' in window);

    deleteNote = (id) => {
        this.setState({
            notes: this.state.notes.filter((note) => note.id !== id),
        });
    };

    render() {
        return <List
            notes={this.state.notes}
            deleteNote={this.deleteNote}
            isTouchScreen={this.isTouchScreen}
        />;
    }
}

export default App;
