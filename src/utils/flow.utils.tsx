import { MarkerType } from 'react-flow-renderer';
import FlowNodeInterface from '../Components/FlowNodeInterface/FlowNodeInterface';
import { Event, FlowEdge, FlowNode } from '../interfaces/Timeline.interface';

export const multiNodeCreation = (data: Array<Event>): Array<FlowNode> => {
  const nodes: Array<FlowNode> = [];
  const spacing = 150;

  data.forEach((rawNode) => {
    nodes.push({
      id: rawNode.id,
      // you can also pass a React component as a label
      data: { label: <div>{rawNode.title}</div> },
      date: rawNode.date,
      position: { x: 100, y: nodes?.[0]?.position?.y + spacing ?? spacing },
    });
  });

  return nodes;
};

export const nodeCreation = ({
  event,
  xPos,
  yPos,
  input,
  output,
}: {
  event: Event;
  xPos: number;
  yPos: number;
  input?: boolean;
  output?: boolean;
}): FlowNode => {
  const node: FlowNode = {
    id: event.id + '',
    data: {
      label: <FlowNodeInterface event={event} />,
    },
    style: { width: '200px', minHeight: '100px' },
    date: event.date,
    position: { x: xPos, y: yPos },
  };

  if (input) {
    node.type = 'input';
  }
  if (output) {
    node.type = 'output';
  }

  return node;
};

export const edgeCreation = (sourceId: string, targetId: string): FlowEdge => {
  return {
    id: `e${sourceId}-${targetId}`,
    source: sourceId + '',
    target: targetId + '',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  };
};
