import TopicData from './TopicData';

type Topic = {
  id: string;
  topic: string;
  sourceId: string;
  destId: string;
  data: Partial<TopicData>;
};

export default Topic;
