import { Node, Edge } from 'react-flow-renderer';

export interface TemporalLink {
  type: TLINK_TYPES;
  sourceId: string;
  targetId: string;
  style?: any;
}

export interface Timeline {
  events: Array<Event>;
  links: Array<TemporalLink>;
}

export interface EventSources {
  sources: Array<string>;
  data: { [key: string]: Timeline };
}

export enum TLINK_TYPES {
  BEFORE = 'before',
  OVERLAPS = 'overlaps',
  CONTAINS = 'contains',
  IDENTITY = 'identity',
}

export interface CLINK {
  [key: string]: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  filename: string;
  type?: string;
}

export interface FlowNode extends Node {
  date: string;
}

export interface IdentityFlowNode extends Node {
  events: Array<Event>;
  date: string;
}

export interface FlowEdge extends Edge {}

export interface FlowData {
  nodes: Array<FlowNode>;
  edges: Array<FlowEdge>;
}
