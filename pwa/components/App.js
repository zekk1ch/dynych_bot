import React from 'react';

const App = () => {
    const handleClick = (e) => alert('Work\'s!');

    return <h1 onClick={handleClick}>Press me</h1>;
};

export default App;
