import type {MessageEvent} from '@foxglove/studio'
import type {
  CreateNode,
  CreatePublisher,
  CreateSubscription,
  DestroyNode,
  DestroyPublisher,
  DestroySubscription,
  NodeEvent,
} from './__types__/NodeEvents'
import type {Node, PubSub} from './__types__/RosEntities'
import type RosStdMsgString from './__types__/RosStdMsgsString'

export default function processNodeEventMessageEvent(
  messageEvent: MessageEvent<unknown>,
  nodes: Node[],
  publishers: PubSub[],
  subscriptions: PubSub[],
) {
  const rosMsgStringEvent = messageEvent as MessageEvent<RosStdMsgString>
  const msg = JSON.parse(rosMsgStringEvent.message.data)
  return processNodeEventMessage(msg, nodes, publishers, subscriptions)
}

function processNodeEventMessage(
  msg: NodeEvent,
  nodes: Node[],
  publishers: PubSub[],
  subscriptions: PubSub[],
): {
  nodes: Node[]
  publishers: PubSub[]
  subscriptions: PubSub[]
} {
  const event = msg.event

  // Create and destroy nodes, publishers, and subscriptions
  if (event === 'create_node') {
    const createNodeMsg = msg as CreateNode
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {event, ...newNode} = createNodeMsg
    if (nodes.every((node) => node.id !== newNode.id)) {
      nodes.push(newNode)
    }
  } else if (event === 'create_publisher') {
    const createPublisherMsg = msg as CreatePublisher
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {event, ...newPublisher} = createPublisherMsg
    if (publishers.every((pub) => pub.id !== newPublisher.id)) {
      publishers.push(newPublisher)
    }
  } else if (event === 'create_subscription') {
    const createSubscriptionMsg = msg as CreateSubscription
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {event, ...newSubscription} = createSubscriptionMsg
    if (subscriptions.every((sub) => sub.id !== newSubscription.id)) {
      subscriptions.push(newSubscription)
    }
  } else if (event === 'destroy_node') {
    const destroyNodeMsg = msg as DestroyNode
    nodes.forEach((node, index) => {
      if (node.id === destroyNodeMsg.id) {
        nodes.splice(index, 1)
      }
    })
  } else if (event === 'destroy_publisher') {
    const destroyPublisherMsg = msg as DestroyPublisher
    publishers.forEach((publisher, index) => {
      if (publisher.id === destroyPublisherMsg.id) {
        publishers.splice(index, 1)
      }
    })
  } else if (event === 'destroy_subscription') {
    const destroySubscriptionMsg = msg as DestroySubscription
    subscriptions.forEach((subscription, index) => {
      if (subscription.id === destroySubscriptionMsg.id) {
        subscriptions.splice(index, 1)
      }
    })
  } else {
    throw new Error(`Unknown message event: ${event}`)
  }

  // connect publishers and subscriptions to nodes
  nodes.forEach((node) => {
    const id = node.id
    node.publisherIds = publishers.filter((pub) => pub.node === id).map((pub) => pub.id)
    node.subscriptionIds = subscriptions.filter((sub) => sub.node === id).map((sub) => sub.id)
  })
  return {
    nodes,
    publishers,
    subscriptions,
  }
}
