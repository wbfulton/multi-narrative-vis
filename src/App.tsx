import React from 'react';
import './App.css';
import Flow from './Flow/Flow';
import useWindowDimensions from './hooks/useWindowDimensions';

// 1. Only show first sentence, toggle for full text
// 2. Increase scale of time so events aren't cramped
// 3. Create labels for edges
// 4. Include dates on nodes
// 5. Clean up Code (easy to read, more modular, no manual px)
// 6. Show multiple narratives

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
