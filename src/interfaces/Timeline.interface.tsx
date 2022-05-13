import { Node, Edge } from 'react-flow-renderer';

export interface TemporalLink {
  type: TLINK_TYPES;
  fromId: string;
  toId: string;
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
  BEFORE = 'BEFORE',
  OVERLAPS = 'OVERLAPS',
  CONTAINS = 'CONTAINS',
  IDENTITY = 'IDENTITY',
}

export interface CLINK {
  [key: string]: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
}

export interface FlowNode extends Node {
  date: string;
}

export interface FlowEdge extends Edge {}

export interface FlowData {
  nodes: Array<FlowNode>;
  edges: Array<FlowEdge>;
}
