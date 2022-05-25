import ReactFlow, { Background, Controls, MiniMap } from 'react-flow-renderer';

import * as chroma from 'chroma.ts';

import {
  createIdentityNodes,
  nextYPos,
} from '../../utils/dataProcessing.utils';
import {
  FlowNode,
  TemporalLink,
  Timeline,
  TLINK_TYPES,
} from '../../interfaces/Timeline.interface';
import { createEdge, nodeCreation } from '../../utils/flow.utils';

const colorScale = chroma.cubehelix().lightness([0.3, 0.7]);

function Flow({ data, width }: { data: Timeline; width: number }) {
  const allSources: Array<string> = [];
  data.events.forEach((ev) => {
    if (!allSources.includes(ev.filename)) {
      allSources.push(ev.filename);
    }
  });

  const sourceColors: Map<string, chroma.Color> = new Map();
  allSources.forEach((source, index) => {
    sourceColors.set(source, colorScale(index / allSources.length + 0.1));
  });

  const sourcePositionMapping: Array<number> = [];
  allSources.forEach((source, index) => {
    let lastX = sourcePositionMapping[index - 1] ?? -250;
    if (index === Math.floor(allSources.length / 2)) {
      lastX += 250;
    }
    sourcePositionMapping.push(lastX + 250);
  });

  const metadataNodes: Array<FlowNode> = [
    nodeCreation({
      event: {
        id: `${0}-meta`,
        title: 'Egypt Crisis',
        date: '',
        filename: TLINK_TYPES.IDENTITY,
      },
      xPos: Math.floor(allSources.length / 2) * 250,
      yPos: 0,
      input: true,
      width,
    }),
    nodeCreation({
      event: {
        id: `${1}-meta`,
        title: 'Common Events',
        date: '',
        filename: TLINK_TYPES.IDENTITY,
      },
      xPos: Math.floor(allSources.length / 2) * 250,
      yPos: 175,
      width,
    }),
  ];

  // make source and main nodes
  allSources.forEach((source, index) => {
    metadataNodes.push(
      nodeCreation({
        event: {
          id: `${index + 2}-meta`,
          title: source,
          date: '',
          filename: source,
        },
        xPos: sourcePositionMapping[index],
        yPos: 175,
        color: sourceColors.get(source),
        output: true,
        width,
      })
    );
  });

  const { identityNodes, newLinks, newEvents } = createIdentityNodes(
    data,
    sourceColors,
    width
  );

  const metadataLinks: Array<TemporalLink> = [
    { sourceId: '0-meta', targetId: '1-meta', type: TLINK_TYPES.BEFORE },
  ];

  metadataNodes.forEach((node, index) => {
    if (index > 1)
      metadataLinks.push({
        sourceId: '0-meta',
        targetId: node.id,
        type: TLINK_TYPES.BEFORE,
      });
  });

  if (identityNodes.length > 0)
    metadataLinks.push({
      sourceId: '0-meta',
      targetId: identityNodes[0].id,
      type: TLINK_TYPES.BEFORE,
    });

  newEvents.sort(
    (e1, e2) => new Date(e1.date).getTime() - new Date(e2.date).getTime()
  );

  let lastNode: FlowNode;

  // Create nodes
  const newNodes = newEvents.map((event, index) => {
    let node;

    node = nodeCreation({
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        filename: event.filename,
      },
      xPos: sourcePositionMapping[allSources.indexOf(event.filename)],
      yPos: nextYPos(event, lastNode), // create all yPos in order
      input: index === 0,
      output: index === newEvents.length - 1,
      color: sourceColors.get(event.filename),
      width,
    });

    lastNode = node;

    return node;
  });

  // Order all nodes by date
  const allNodes = [...identityNodes, ...newNodes];
  allNodes.sort(
    (e1, e2) => new Date(e1.date).getTime() - new Date(e2.date).getTime()
  );

  // fix event order
  const fixedNodes = allNodes.map((node, index) => {
    if (index === 0) {
      node.position.y = 350;
      return node;
    }

    if (
      Math.abs(
        new Date(node.date).getTime() -
          new Date(allNodes[index - 1].date).getTime()
      ) /
        (1000 * 60 * 60 * 24 * 1) <
      1
    ) {
      node.position.y = allNodes[index - 1].position.y;
      return node;
    }

    node.position.y = allNodes[index - 1].position.y + 175;
    return node;
  });

  const links = [...metadataLinks, ...newLinks].map(
    ({ sourceId, targetId, style }) => {
      // if start and end is ident node, then black
      // anything else take that sources color
      const sourceFilename = [...fixedNodes, ...metadataNodes].filter(
        (node) => {
          return node.id === sourceId + '';
        }
      )[0]?.data?.filename;
      const targetFilename = [...fixedNodes, ...metadataNodes].filter(
        (node) => node.id === targetId + ''
      )[0]?.data?.filename;

      let color: any = 'black';

      if (sourceFilename !== TLINK_TYPES.IDENTITY) {
        color = sourceColors.get(sourceFilename);
      } else if (targetFilename !== TLINK_TYPES.IDENTITY) {
        color = sourceColors.get(targetFilename);
      }

      return createEdge(sourceId, targetId, { ...style, stroke: color });
    }
  );
  return (
    <ReactFlow
      nodes={[...identityNodes, ...fixedNodes, ...metadataNodes]}
      edges={links}
      minZoom={-10000}
      maxZoom={10000}
      defaultZoom={-10000}
    >
      <Background />
      <Controls></Controls>
      <MiniMap />
    </ReactFlow>
  );
}

export default Flow;
