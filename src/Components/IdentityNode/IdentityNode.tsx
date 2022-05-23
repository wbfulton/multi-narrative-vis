import React, { useState } from 'react';
import { Event } from '../../interfaces/Timeline.interface';
import FlowNode from '../FlowNode/FlowNode';
import styles from './IdentityNode.module.css';
import * as chroma from 'chroma.ts';

const IdentityNode = ({
  events,
  sourceColors,
}: {
  events: Array<Event>;
  sourceColors: Map<string, chroma.Color>;
}) => {
  const [eventIdx, setEventIdx] = useState<number>(0);

  const allSources: Array<string> = [];
  events.forEach((ev) => {
    if (!allSources.includes(ev.filename)) {
      allSources.push(ev.filename);
    }
  });

  return (
    <div>
      <div>
        {allSources.map((source, index) => (
          <button
            className={styles.source}
            style={{
              border: `3px solid ${sourceColors.get(source)}`,
              filter: `brightness(${eventIdx === index ? '90%' : '100%'})`,
            }}
            key={index}
            onClick={() => setEventIdx(index)}
          >
            {source}
          </button>
        ))}
      </div>
      <FlowNode event={events[eventIdx]} />
    </div>
  );
};

export default IdentityNode;
