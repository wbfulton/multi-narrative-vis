import React from 'react';
import './App.css';
import Flow from './Components/Flow/Flow';
import useWindowDimensions from './hooks/useWindowDimensions';

// - Figure out way for event co-referencing textual events
// - Create a main storyline where sources branch off of the main (agreed upon) storyline
//     - try just links between same events first,

//     - Branching tree
//     - middle is agreed upon by multiple sources
//     - can have tab system for which source to read from
//     - branches represent events by only one source
//     - all events need to be ordered by date
//     - need color coding system for the source on events

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
