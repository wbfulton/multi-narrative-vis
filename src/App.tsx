import React from 'react';
import './App.css';
import Flow from './Components/Flow/Flow';
import useWindowDimensions from './hooks/useWindowDimensions';

// - Remove timeline
// - Create Starting Node detailing event for the interface
// - Figure out way for event co-referencing textual events
// - Create a main storyline where sources branch off of the main (agreed upon) storyline
//     - Branching tree
// - Create labels on edges
// - Create causality annotation system
// - Create interface to select which sources and event you want to look at

function App() {
  const { height, width } = useWindowDimensions();

  return (
    <div className="App">
      <div className="data">
        <div style={{ height, width }}>
          <Flow />
        </div>
      </div>
    </div>
  );
}

export default App;
