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
import { edgeCreation, nodeCreation } from '../../utils/flow.utils';

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

const allData = [
  reutersTimeline,
  apTimeline,
  guardianTimeline,
  latimesTimeline,
];

const initialNode = nodeCreation({
  event: { id: '0', title: 'Egypt Crises', date: '2011-01-01' },
  xPos: allData[allData.length - 1].nodes[0].position.x / 2,
  yPos: -200,
  input: true,
});

const initalEdges = allData.map((data) => {
  return edgeCreation('0', data.nodes[0].id);
});

function Flow() {
  const [nodes, setNodes] = useState([
    initialNode,
    ...reutersTimeline.nodes,
    ...apTimeline.nodes,
    ...guardianTimeline.nodes,
    ...latimesTimeline.nodes,
  ]);
  const [edges, setEdges] = useState([
    ...initalEdges,
    ...reutersTimeline.edges,
    ...apTimeline.edges,
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
