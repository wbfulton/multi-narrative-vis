import React from 'react';
import './App.css';
import Flow from './Components/Flow/Flow';
import useWindowDimensions from './hooks/useWindowDimensions';

function App() {
  const { height, width } = useWindowDimensions();

  return (
    <div className="App">
      <div>
        <input type="radio" value="Male" name="gender" /> Male
        <input type="radio" value="Female" name="gender" /> Female
        <input type="radio" value="Other" name="gender" /> Other
      </div>
      <div className="data">
        <div style={{ height, width }}>
          <Flow />
        </div>
      </div>
    </div>
  );
}

export default App;
