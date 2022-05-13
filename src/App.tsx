import React from 'react';
import './App.css';
import Flow from './Components/Flow/Flow';
import useWindowDimensions from './hooks/useWindowDimensions';

// 1. Fix bugs
// 3. Create labels for edges
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
