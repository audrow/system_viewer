import {GraphEdge, GraphNode, GraphTopic} from './__types__/GraphElements'
import type {Node, PubSub} from './__types__/RosEntities'
import type {TopicHelper, TopicHelperMap} from './__types__/TopicHelper'

export default function toGraph(nodes: Node[], publishers: PubSub[], subscriptions: PubSub[]) {
  // make nodes
  const graphNodes: GraphNode[] = nodes.map((node) => ({
    id: node.id,
    type: 'rosNode',
    data: {
      namespace: node.namespace,
      label: node.name,
    },
  }))

  // make topics
  const topicHelperMap: TopicHelperMap = {}
  nodes.map((node) => {
    updateTopicHelperMap(topicHelperMap, node, publishers, true)
    updateTopicHelperMap(topicHelperMap, node, subscriptions, false)
  })

  const graphTopics: GraphTopic[] = []
  const graphEdges: GraphEdge[] = []
  Object.entries(topicHelperMap).forEach(([topic, helper]) => {
    const topicId = `topic-${topic}`
    graphTopics.push({
      id: topicId,
      type: 'rosTopic',
      data: {
        label: helper.topic,
        namespace: helper.namespace,
      },
    })
    Object.entries(helper.publishers).forEach(([id, pubSubHelper]) => {
      graphEdges.push({
        id: `${id}-${topic}`,
        source: id,
        target: topicId,
        type: 'default',
        animated: true,
        label: JSON.stringify(pubSubHelper.qos),
      })
    })
    Object.entries(helper.subscriptions).forEach(([id, pubSubHelper]) => {
      graphEdges.push({
        id: `${id}-${topic}`,
        source: topicId,
        target: id,
        type: 'default',
        animated: true,
        label: JSON.stringify(pubSubHelper.qos),
      })
    })
  })

  return {
    nodes: graphNodes,
    topics: graphTopics,
    edges: graphEdges,
  }
}

function updateTopicHelperMap(
  topicHelperMap: TopicHelperMap,
  node: Node,
  pubSubs: PubSub[],
  isPub: boolean,
) {
  const pubOrSub = isPub ? 'publishers' : 'subscriptions'
  const nodePubSubs = node[isPub ? 'publisherIds' : 'subscriptionIds']
    .map((id) => pubSubs.find((pubSub) => pubSub.id === id))
    .filter((pubSub) => !!pubSub) as PubSub[]
  nodePubSubs.forEach((pubSub) => {
    const namespaceAndTopic =
      node.namespace === '' ? pubSub.topic : `${node.namespace}/${pubSub.topic}`
    if (topicHelperMap[namespaceAndTopic]) {
      if (!topicHelperMap[namespaceAndTopic]![pubOrSub][pubSub.id]) {
        topicHelperMap[namespaceAndTopic]![pubOrSub][pubSub.id] = {
          nodeId: node.id,
          qos: pubSub.qos,
        }
      } else {
        console.warn(`Duplicate pub/sub for ${namespaceAndTopic}`)
      }
    } else {
      let publishers: TopicHelper['publishers'] = {}
      let subscriptions: TopicHelper['subscriptions'] = {}
      if (isPub) {
        publishers[pubSub.id] = {
          nodeId: node.id,
          qos: pubSub.qos,
        }
        subscriptions = {}
      } else {
        publishers = {}
        subscriptions[pubSub.id] = {
          nodeId: node.id,
          qos: pubSub.qos,
        }
      }
      topicHelperMap[namespaceAndTopic] = {
        topic: pubSub.topic,
        namespace: node.namespace,
        publishers,
        subscriptions,
      }
    }
  })
}
