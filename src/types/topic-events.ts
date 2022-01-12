import Topic from './Topic';

export type TopicEvent = Pick<Topic, 'id'> | {
  event: string;
}

export type CreateTopicEvent = {
  event: "create";
} | Topic

export type DeleteTopicEvent = {
  event: "destroy";
} | Pick<Topic, 'id'>

export type UpdateTopicEvent = {
  event: "update";
  data: string;
} | Pick<Topic, 'id'>
