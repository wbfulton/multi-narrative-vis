import React, { useState } from 'react';
import './App.css';
import Flow from './Components/Flow/Flow';
import useWindowDimensions from './hooks/useWindowDimensions';
import { Timeline } from './interfaces/Timeline.interface';

function App() {
  const { height, width } = useWindowDimensions();

  const egypt: Timeline = JSON.parse(
    require('./processed-timeline/crisis-egypt.json')
  );
  const libya: Timeline = JSON.parse(
    require('./processed-timeline/crisis-libya.json')
  );

  const [data, setData] = useState<Timeline>(egypt);
  const [showCustom, toggleCustom] = useState<boolean>(false);
  const [customJson, setCustomJson] = useState<string>('');

  return (
    <div className="App">
      <div style={{ padding: '10px' }}>
        <h1>Multi-Narrative Visualization Tool</h1>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => setData(egypt)} className={'dataset'}>
            Egypt Crisis
          </button>
          <button onClick={() => setData(libya)} className={'dataset'}>
            Libya Crisis
          </button>
          <button
            onClick={() => toggleCustom(!showCustom)}
            className={'dataset'}
          >
            Custom
          </button>
        </div>
      </div>
      {showCustom && (
        <div className="customArea">
          <textarea
            onChange={(e) => setCustomJson(e.target.value)}
            value={customJson}
          />
          <button
            className={'dataset'}
            onClick={() => {
              const customData = JSON.parse(customJson);
              if (typeof customData === 'object') {
                setData(customData);
              } else {
                setData(JSON.parse(customData));
              }
            }}
          >
            Visualize Data
          </button>
        </div>
      )}

      <div className="data">
        <div style={{ height: height * 0.8, width }}>
          <Flow width={width} data={data} />
        </div>
      </div>
    </div>
  );
}

export default App;
