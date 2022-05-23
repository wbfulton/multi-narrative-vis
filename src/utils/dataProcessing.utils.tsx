import {
  EventSources,
  FlowEdge,
  FlowNode,
  Timeline,
  FlowData,
  TLINK_TYPES,
  TemporalLink,
  Event,
  IdentityFlowNode,
} from '../interfaces/Timeline.interface';
import { createEdge, identityNodeCreation, nodeCreation } from './flow.utils';

import * as chroma from 'chroma.ts';

export const createIdentityNodes = (data: Timeline) => {
  // merge ids
  const identityLinks = data.links.filter(
    (link) => link.type === TLINK_TYPES.IDENTITY
  );
  let mergedIds: Array<Set<string>> = [];
  identityLinks.forEach((link) => {
    const id1 = link.sourceId;
    const id2 = link.targetId;
    mergedIds.push(new Set([id1, id2]));
  });
  const shouldMerge = (set1: Set<string>, set2: Set<string>) => {
    let merge = false;
    set1.forEach((strNum) => {
      merge = merge || set2.has(strNum);
    });
    return merge;
  };

  let i = 0;
  while (i < mergedIds.length - 1) {
    const idx = i;
    let index = i + 1;
    while (index < mergedIds.length - 1) {
      if (shouldMerge(mergedIds[idx], mergedIds[index])) {
        const newSet = new Set<string>();
        mergedIds[idx].forEach((val) => {
          newSet.add(val);
        });
        mergedIds[index].forEach((val) => {
          newSet.add(val);
        });
        mergedIds[idx] = newSet;
        mergedIds = [
          ...mergedIds.slice(0, index),
          ...mergedIds.slice(index + 1),
        ];
        i = -1;
      }
      index += 1;
    }

    i += 1;
  }

  const arrMergedIds: Array<Array<string>> = [];
  mergedIds.forEach((set) => {
    arrMergedIds.push(Array.from(set));
  });

  // sort all arr
  arrMergedIds.map((ids) => {
    return ids.sort((id1, id2) => {
      return Number.parseInt(id1) - Number.parseInt(id2);
    });
  });
  arrMergedIds.sort((id1, id2) => {
    return Number.parseInt(id1[0]) - Number.parseInt(id2[0]);
  });

  const identityNodes: Array<IdentityFlowNode> = [];

  const allSources: Array<string> = [];
  data.events.forEach((ev) => {
    if (!allSources.includes(ev.filename)) {
      allSources.push(ev.filename);
    }
  });

  arrMergedIds.forEach((ids, index) => {
    identityNodes.push(
      identityNodeCreation({
        events: data.events
          .filter((event) => ids.includes(event.id))
          .sort((e1, e2) => {
            return Number.parseInt(e1.id) - Number.parseInt(e2.id);
          }),
        xPos: Math.floor(allSources.length / 2) * 250,
        yPos: 300 * index,
        // output: index === mergedIds.length - 1,
      })
    );
  });

  // filter out identity links
  const nonIdentLinks: Array<TemporalLink> = data.links.filter(
    (link: TemporalLink) => {
      return link.type !== TLINK_TYPES.IDENTITY;
    }
  );

  const identLinks: Array<Array<string>> = [];
  // remove all links pointing to identity nodes
  const newLinks = nonIdentLinks.filter((link) => {
    let nonIdent = true;
    let temp = [link.sourceId + '', link.targetId + ''];

    identityNodes.forEach((node) => {
      const ids = node.data.events.map((event: any) => event.id);
      if (ids.includes(link.sourceId)) {
        temp = [node.id, temp[1]];
        nonIdent = false;
      }
      if (ids.includes(link.targetId)) {
        temp = [temp[0], node.id];
        nonIdent = false;
      }
    });

    if (!nonIdent) {
      identLinks.push(temp);
    }

    return nonIdent;
  });

  // create main storyline links
  identityNodes.forEach((node, index) => {
    if (index !== identityNodes.length - 1) {
      const test = [node.id, identityNodes[index + 1].id];

      if (
        !identLinks.find((link) => link[0] === test[0] && link[1] === test[1])
      ) {
        identLinks.push(test);
      }
    }
  });

  // add all links relating to identity nodes
  Array.from(identLinks).forEach((link) => {
    newLinks.push({
      sourceId: link[0],
      targetId: link[1],
      type: TLINK_TYPES.BEFORE,
    });
  });

  const newNodes = data.events.filter((event: Event) => {
    let notIdentity = true;
    arrMergedIds.forEach((arr) => {
      if (arr.includes(event.id)) {
        notIdentity = false;
      }
    });

    return notIdentity;
  });

  const removeDupes = new Set(newLinks);

  return {
    identityNodes,
    newEvents: newNodes,
    newLinks: Array.from(removeDupes),
  };
};

const getLastY = (lastTimeline?: FlowData): number => {
  const lastNode = lastTimeline?.nodes?.[lastTimeline?.nodes?.length - 1];
  const parsedNodeId = Number.parseInt(lastNode?.id ?? '0');
  return parsedNodeId !== 0 ? parsedNodeId : parsedNodeId + 1;
};

export const getTimeline = ({
  data,
  x,
  lastTimeline,
  color,
}: {
  data: Timeline;
  lastTimeline?: FlowData;
  x?: number;
  color: chroma.Color;
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
          id: getLastY(lastTimeline) + 1 + event.id,
          title: event.title,
          date: event.date,
          type: event.type,
          filename: event.filename,
        },
        xPos,
        yPos: nodes.length > 0 ? nodes[nodes.length - 1].position.y + 200 : 0,
        output: index === data.events.length - 1,
        color,
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
      createEdge(
        getLastY(lastTimeline) + 1 + link.sourceId,
        getLastY(lastTimeline) + 1 + link.targetId
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
        filename: '',
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
          filename: '',
        },
        xPos: 0,
        yPos: nodes[i - 1].position.y + spacing,
        output: i === ticks,
      })
    );

    edges.push(createEdge(id - 1 + '', id + ''));
    id += 1;
  }

  return { nodes, edges };
};

export const nextYPos = (event: Event, lastNode: FlowNode) => {
  if (!lastNode) {
    return 0;
  }

  if (
    Math.abs(
      new Date(event.date).getTime() - new Date(lastNode.date).getTime()
    ) *
      1000 *
      60 *
      60 *
      24 *
      3 <
    3
  ) {
    return lastNode.position.y;
  }
  return lastNode.position.y + 175;
};
