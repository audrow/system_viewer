import Node from './Node';

export type NodeEvent = Pick<Node, 'id'> | {
  event: string
}

export type CreateNodeEvent = {
  event: "create";
} | Node

export type DeleteNodeEvent = {
  event: "destroy";
} | Pick<Node, 'id'>

export type UpdateNodeEvent = {
  event: "update";
  data: string;
} | Pick<Node, 'id'>
