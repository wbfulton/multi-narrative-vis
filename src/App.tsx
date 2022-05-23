import React from 'react';
import './App.css';
import Flow from './Components/Flow/Flow';
import useWindowDimensions from './hooks/useWindowDimensions';

function App() {
  const { height, width } = useWindowDimensions();

  return (
    <div className="App">
      <div className="data">
        <div style={{ height, width }}>
          <Flow width={width} />
        </div>
      </div>
    </div>
  );
}

export default App;
