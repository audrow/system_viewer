import Node from "./Node";

export type NodeEvent = {
  event: string;
} & Pick<Node, "id">;

export type CreateNodeEvent = {
  event: "create";
} & Node;

export type DestroyNodeEvent = {
  event: "destroy";
} & Pick<Node, "id">;
