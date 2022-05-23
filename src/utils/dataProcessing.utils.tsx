import {
  FlowNode,
  Timeline,
  TLINK_TYPES,
  TemporalLink,
  Event,
  IdentityFlowNode,
} from '../interfaces/Timeline.interface';
import { identityNodeCreation } from './flow.utils';

import * as chroma from 'chroma.ts';

export const createIdentityNodes = (
  data: Timeline,
  sourceColors: Map<string, chroma.Color>,
  width: number
) => {
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
        sourceColors,
        width,
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
