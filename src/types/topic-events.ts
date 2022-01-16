import Topic from "./Topic";
import TopicData from "./TopicData";

export type TopicEvent = {
  event: string;
} & Pick<Topic, "id">;

export type CreateTopicEvent = {
  event: "create";
} & Topic;

export type DestroyTopicEvent = {
  event: "destroy";
} & Pick<Topic, "id">;

export type UpdateTopicEvent = {
  event: "update";
  data: TopicData;
} & Pick<Topic, "id">;
