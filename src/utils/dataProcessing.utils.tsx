import {
  EventSources,
  FlowEdge,
  FlowNode,
  Timeline,
  FlowData,
} from '../interfaces/Timeline.interface';
import { edgeCreation, nodeCreation } from './flow.utils';

const reutersEgyptData: Timeline = JSON.parse(
  require('../processed-timeline/crisis-egypt/reuters.json')
);
const apEgyptData: Timeline = JSON.parse(
  require('../processed-timeline/crisis-egypt/guardian.json')
);
const laTimesEgyptData: Timeline = JSON.parse(
  require('../processed-timeline/crisis-egypt/latimes.json')
);
const guardianEgyptData: Timeline = JSON.parse(
  require('../processed-timeline/crisis-egypt/reuters.json')
);

export const egyptCrisisData: EventSources = {
  sources: ['reuters', 'ap', 'latimes', 'guardian'],
  data: {
    reuters: reutersEgyptData,
    ap: apEgyptData,
    latimes: laTimesEgyptData,
    guardian: guardianEgyptData,
  },
};

const getLastY = (lastTimeline?: FlowData): number => {
  return lastTimeline?.nodes?.length ?? 0;
};

export const getTimeline = ({
  data,
  x,
  lastTimeline,
}: {
  data: Timeline;
  lastTimeline?: FlowData;
  x?: number;
}) => {
  const nodes: Array<FlowNode> = [];
  const edges: Array<FlowEdge> = [];

  let xPos = x ? x + 300 : 0;
  if (lastTimeline) {
    let maxX = 0;
    lastTimeline.nodes.forEach(
      (node) => (maxX = Math.max(maxX, node.position.x))
    );
    xPos = maxX + 300;
  }

  // find rightmost node from last timeline
  data.events.forEach((event, index) => {
    nodes.push(
      nodeCreation({
        event: {
          id: getLastY(lastTimeline) + event.id,
          title: event.title,
          date: event.date,
        },
        xPos,
        yPos: nodes.length > 0 ? nodes[nodes.length - 1].position.y + 200 : 0,
        input: index === 0,
        output: index === data.events.length - 1,
      })
    );
  });

  const overlapSequences: Array<Array<number>> = [];
  let currentSequence: Array<number> = [];

  // find overlapping nodes
  nodes.forEach((node, index) => {
    if (index !== 0) {
      if (node.position.y - nodes[index - 1].position.y <= 150) {
        if (!currentSequence.includes(index - 1)) {
          currentSequence.push(index - 1);
        }
        currentSequence.push(index);
      } else if (currentSequence.length > 0) {
        overlapSequences.push(currentSequence);
        currentSequence = [];
      }
    }
  });

  if (currentSequence.length > 0) {
    overlapSequences.push(currentSequence);
    currentSequence = [];
  }
  const xShift = 210;

  // shift overlapping nodes
  overlapSequences.forEach((sequence) => {
    const midIndex = Math.floor(sequence.length / 2) - 1;
    // go left
    let shiftTracker = 1;
    for (let i = midIndex - 1; i >= 0; i--) {
      const nodeIndex = sequence[i];
      nodes[nodeIndex].position.x -= xShift * shiftTracker;
      shiftTracker += 1;
    }
    // go right
    shiftTracker = 1;
    for (let i = midIndex + 1; i < sequence.length; i++) {
      const nodeIndex = sequence[i];
      nodes[nodeIndex].position.x += xShift * shiftTracker;
      shiftTracker += 1;
    }
  });

  // shift timeline to account for overlapping nodes
  if (overlapSequences.length > 0) {
    const longestSequence = overlapSequences.sort((a, b) => {
      return b.length - a.length;
    })[0];
    const nodeShift = Math.floor(longestSequence.length / 2) - 1;
    nodes.map((node) => (node.position.x += nodeShift * xShift));
  }

  data.links.forEach((link) => {
    edges.push(
      edgeCreation(
        getLastY(lastTimeline) + link.fromId,
        getLastY(lastTimeline) + link.toId
      )
    );
  });

  return { nodes, edges };
};

export const getYFromTimeline = ({
  date,
  dateTimeline,
}: {
  date: Date;
  dateTimeline: FlowData;
}) => {
  const oldestDateNode: FlowNode = dateTimeline.nodes[0];
  const newestDateNode: FlowNode =
    dateTimeline.nodes[dateTimeline.nodes.length - 1];
  // find where date lies between millisecond of dates
  const dateMs = date.getTime();
  const oldestMs = new Date(oldestDateNode.date).getTime();
  const newestMs = new Date(newestDateNode.date).getTime();
  const oldestY = oldestDateNode.position.y;
  const newestY = newestDateNode.position.y;

  // convert date proportion to y proportion
  return (
    oldestY +
    ((newestY - oldestY) / (newestMs - oldestMs)) * (dateMs - oldestMs)
  );
};

export const getDateTimeline = ({
  data,
  ticks,
  spacing,
}: {
  data: EventSources;
  ticks: number;
  spacing: number;
}) => {
  let oldestDate: Date = new Date();
  let newestDate: Date = new Date(-8640000000000000);

  // get oldest and newest date
  data.sources.forEach((source) => {
    data.data[source].events.forEach((event) => {
      const date = new Date(event.date);
      if (date < oldestDate) {
        oldestDate = date;
      } else if (date > newestDate) {
        newestDate = date;
      }
    });
  });

  // calculate num days between dates
  const timeDiff = oldestDate.getTime() - newestDate.getTime();
  const daysDiff = Math.abs(timeDiff / (1000 * 3600 * 24));

  let id = 0;

  // create scale array according to num ticks passed in
  const dayScale = daysDiff / ticks;
  const nodes: Array<FlowNode> = [
    nodeCreation({
      event: {
        id: id + '',
        title: '',
        date: oldestDate.toDateString(),
      },
      xPos: 0,
      yPos: 0,
      input: true,
    }),
  ];
  id += 1;

  const edges = [];

  for (let i = 1; i < ticks + 1; i++) {
    const nextDate = new Date(
      new Date(nodes[i - 1].date).getTime() + 1000 * 3600 * 24 * dayScale
    );

    nodes.push(
      nodeCreation({
        event: {
          id: id + '',
          title: '',
          date: nextDate.toDateString(),
        },
        xPos: 0,
        yPos: nodes[i - 1].position.y + spacing,
        output: i === ticks,
      })
    );

    edges.push(edgeCreation(id - 1 + '', id + ''));
    id += 1;
  }

  return { nodes, edges };
};
