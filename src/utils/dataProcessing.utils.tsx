import {
  EventSources,
  FlowNode,
  Timeline,
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

export const getDateTimeline = (data: EventSources, ticks: number) => {
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
    nodeCreation(
      {
        id: id + '',
        title: oldestDate.toDateString(),
        date: oldestDate.toDateString(),
      },
      undefined,
      true
    ),
  ];
  id += 1;

  const edges = [];

  for (let i = 1; i < ticks + 1; i++) {
    const nextDate = new Date(
      new Date(nodes[i - 1].date).getTime() + 1000 * 3600 * 24 * dayScale
    );

    nodes.push(
      nodeCreation(
        {
          id: id + '',
          title: nextDate.toDateString(),
          date: nextDate.toDateString(),
        },
        nodes[i - 1].position.y,
        false,
        i === ticks
      )
    );

    edges.push(edgeCreation(id - 1 + '', id + ''));
    id += 1;
  }

  return { nodes, edges };
};
