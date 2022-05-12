import { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
} from 'react-flow-renderer';

import {
  egyptCrisisData,
  getDateTimeline,
  getTimeline,
} from '../utils/dataProcessing.utils';

const dateTimeline = getDateTimeline(egyptCrisisData, 15, 200);

const reutersApTimeline = getTimeline(
  egyptCrisisData.data['reuters'],
  200,
  200
);

console.log(reutersApTimeline);

function Flow() {
  const [nodes, setNodes] = useState([
    ...dateTimeline.nodes,
    ...reutersApTimeline.nodes,
  ]);
  const [edges, setEdges] = useState([
    ...dateTimeline.edges,
    ...reutersApTimeline.edges,
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
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}

export default Flow;
