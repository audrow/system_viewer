import {Id} from './RosEntities'

export type PubSubHelper = {
  nodeId: Id
  qos: {
    [stat: string]: number | string
  }
}

export type TopicHelper = {
  topic: string
  namespace: string
  publishers: {
    [id: Id]: PubSubHelper
  }
  subscriptions: {
    [id: Id]: PubSubHelper
  }
}

export type TopicHelperMap = {
  [namespaceAndTopic: string]: TopicHelper
}

export default TopicHelper
