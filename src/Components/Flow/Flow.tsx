import { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
} from 'react-flow-renderer';

import { egyptCrisisData, getTimeline } from '../../utils/dataProcessing.utils';

const reutersTimeline = getTimeline({
  data: egyptCrisisData.data['reuters'],
  x: 0,
});

const apTimeline = getTimeline({
  data: egyptCrisisData.data['ap'],
  lastTimeline: reutersTimeline,
});

const guardianTimeline = getTimeline({
  data: egyptCrisisData.data['guardian'],
  lastTimeline: apTimeline,
});

const latimesTimeline = getTimeline({
  data: egyptCrisisData.data['latimes'],
  lastTimeline: guardianTimeline,
});

function Flow() {
  const [nodes, setNodes] = useState([
    ...reutersTimeline.nodes,
    // ...apTimeline.nodes,
    ...guardianTimeline.nodes,
    ...latimesTimeline.nodes,
  ]);
  const [edges, setEdges] = useState([
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
