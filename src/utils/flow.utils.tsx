import { MarkerType, Position } from 'react-flow-renderer';
import FlowNodeInterface from '../Components/FlowNodeInterface/FlowNodeInterface';
import {
  Event,
  FlowEdge,
  FlowNode,
  IdentityFlowNode,
  TLINK_TYPES,
} from '../interfaces/Timeline.interface';

import * as chroma from 'chroma.ts';

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

export const identityNodeCreation = ({
  events,
  xPos,
  yPos,
  input,
  output,
  color,
}: {
  events: Array<Event>;
  xPos: number;
  yPos: number;
  input?: boolean;
  output?: boolean;
  color?: chroma.Color;
}): IdentityFlowNode => {
  const node: IdentityFlowNode = {
    id: 'ident-' + events[0].id,
    data: {
      filename: TLINK_TYPES.IDENTITY,
      label: <FlowNodeInterface event={events[0]} />,
      style: {
        width: '200px',
        minHeight: '100px',
        borderColor: `${color}`,
        borderWidth: '3px',
      },
      events,
    },
    style: {
      width: '200px',
      minHeight: '100px',
      borderColor: `${color}`,
      borderWidth: '3px',
    },
    events,
    date: events[0].date,
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

export const nodeCreation = ({
  event,
  xPos,
  yPos,
  input,
  output,
  color,
}: {
  event: Event;
  xPos: number;
  yPos: number;
  input?: boolean;
  output?: boolean;
  color?: chroma.Color;
}): FlowNode => {
  const node: FlowNode = {
    id: event.id + '',
    type: event.type,
    data: {
      filename: event.filename,
      label: <FlowNodeInterface event={event} />,
      style: {
        width: '200px',
        minHeight: '100px',
        borderColor: `${color}`,
        borderWidth: '3px',
      },
    },
    style: {
      width: '200px',
      minHeight: '100px',
      borderColor: `${color}`,
      borderWidth: '3px',
    },
    sourcePosition: Position.Bottom,
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

export const createEdge = (
  sourceId: string,
  targetId: string,
  style?: any
): FlowEdge => {
  let edge = {
    id: `e${sourceId}-${targetId}`,
    source: sourceId + '',
    target: targetId + '',
    style,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  };
  if (style) {
    edge.style = style;
  }
  return edge;
};
