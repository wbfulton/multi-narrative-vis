import { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
} from 'react-flow-renderer';

import {
  egyptCrisisData,
  getDateTimeline,
  getTimeline,
} from '../../utils/dataProcessing.utils';

const dateTimeline = getDateTimeline({
  data: egyptCrisisData,
  ticks: 20,
  spacing: 650,
});

const reutersTimeline = getTimeline({
  data: egyptCrisisData.data['reuters'],
  dateTimeline,
});

const apTimeline = getTimeline({
  data: egyptCrisisData.data['ap'],
  dateTimeline,
  lastTimeline: reutersTimeline,
});

const guardianTimeline = getTimeline({
  data: egyptCrisisData.data['guardian'],
  dateTimeline,
  lastTimeline: reutersTimeline,
});

const latimesTimeline = getTimeline({
  data: egyptCrisisData.data['latimes'],
  dateTimeline,
  lastTimeline: reutersTimeline,
});

function Flow() {
  const [nodes, setNodes] = useState([
    ...dateTimeline.nodes,
    ...reutersTimeline.nodes,
    // ...apTimeline.nodes,
    ...guardianTimeline.nodes,
    ...latimesTimeline.nodes,
  ]);
  const [edges, setEdges] = useState([
    ...dateTimeline.edges,
    ...reutersTimeline.edges,
    // ...apTimeline.edges,
    ...guardianTimeline.edges,
    ...latimesTimeline.edges,
  ]);

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
