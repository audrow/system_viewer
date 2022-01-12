export type Event = {
  type: "node" | "topic";
  event: "create" | "destroy" | "update";
  id: string;
}

export type CreateNodeEvent = {
  type: "node"
  event: "create";
  id: string;
  name: string;
  namespace: string;
}

export type DestroyNodeEvent = {
  type: "node"
  event: "destroy";
  id: string;
};

export type UpdateNodeEvent = {
  type: "node"
  event: "update";
  id: string;
  data: string;
}

export type CreateTopicEvent = {
  type: "topic"
  event: "create";
  id: string;
  sourceId: string;
  targetId: string;
}

export type DestroyTopicEvent = {
  type: "topic"
  event: "destroy";
  id: string;
}

export type UpdateTopicEvent = {
  type: "topic"
  event: "update";
  id: string;
  data: string;
}