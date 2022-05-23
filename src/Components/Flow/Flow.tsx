import { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
} from 'react-flow-renderer';

import * as chroma from 'chroma.ts';

import {
  createIdentityNodes,
  nextYPos,
} from '../../utils/dataProcessing.utils';
import CoreferenceNode from '../CoreferenceNode/CoferenceNode';
import {
  FlowNode,
  TemporalLink,
  Timeline,
  TLINK_TYPES,
} from '../../interfaces/Timeline.interface';
import { createEdge, nodeCreation } from '../../utils/flow.utils';

const colorScale = chroma.cubehelix().lightness([0.3, 0.7]);

const nodeTypes = { coreferenceNode: CoreferenceNode };

function Flow() {
  const data: Timeline = JSON.parse(
    require('../../processed-timeline/crisis-egypt.json')
  );

  const allSources: Array<string> = [];
  data.events.forEach((ev) => {
    if (!allSources.includes(ev.filename)) {
      allSources.push(ev.filename);
    }
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
    }),
    nodeCreation({
      event: {
        id: `${1}-meta`,
        title: 'Common Ground Narrative',
        date: '',
        filename: TLINK_TYPES.IDENTITY,
      },
      xPos: Math.floor(allSources.length / 2) * 250,
      yPos: 175,
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
        color: colorScale(index / allSources.length + 0.1),
        output: true,
      })
    );
  });

  const { identityNodes, newLinks, newEvents } = createIdentityNodes(data);

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
      color: colorScale(
        allSources.indexOf(event.filename) / allSources.length + 0.1
      ),
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
        color = colorScale(
          allSources.indexOf(sourceFilename) / allSources.length + 0.1
        );
      } else if (targetFilename !== TLINK_TYPES.IDENTITY) {
        color = colorScale(
          allSources.indexOf(targetFilename) / allSources.length + 0.1
        );
      }

      return createEdge(sourceId, targetId, { ...style, stroke: color });
    }
  );

  const [nodes, setNodes] = useState([
    ...identityNodes,
    ...fixedNodes,
    ...metadataNodes,
  ]);
  const [edges, setEdges] = useState(links);

  const onNodesChange = useCallback(
    // @ts-ignore
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    // @ts-ignore
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback(
    // @ts-ignore
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      minZoom={-10000}
      maxZoom={10000}
      defaultZoom={-10000}
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}

export default Flow;
