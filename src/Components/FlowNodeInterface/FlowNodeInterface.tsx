import React, { useState } from 'react';
import styles from './FlowNodeInterface.module.css';
import { Event } from '../../interfaces/Timeline.interface';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const FlowNodeInterface = ({ event }: { event: Event }) => {
  const sentences = event.title.split('. ');

  const [showFullContent, toggleFullContent] = useState<boolean>(false);

  return (
    <div>
      <p>{event.date}</p>
      <p>{sentences[0]}</p>
      {sentences.length > 2 && showFullContent && (
        <div>
          {sentences.slice(1).map((sentence, index) => (
            <p key={index}>{sentence}</p>
          ))}
        </div>
      )}
      {sentences.length > 2 && (
        <FontAwesomeIcon
          className={styles.icon}
          icon={showFullContent ? faChevronUp : faChevronDown}
          onClick={() => toggleFullContent(!showFullContent)}
        />
      )}
    </div>
  );
};

export default FlowNodeInterface;
