import React, { useState } from 'react';
import styles from './FlowNodeInterface.module.css';
import { Event } from '../../interfaces/Timeline.interface';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const FlowNodeInterface = ({ event }: { event: Event }) => {
  const characters = event.title.split('');

  const [showFullContent, toggleFullContent] = useState<boolean>(false);

  return (
    <div>
      <p>{event.date}</p>
      {!showFullContent && (
        <p>
          {characters.slice(0, 100)}
          {characters.length > 100 ? '...' : ''}
        </p>
      )}
      {characters.length > 100 && showFullContent && <div>{characters}</div>}
      {characters.length > 100 && (
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
