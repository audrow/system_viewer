import type {MessageEvent, Time} from '@foxglove/studio'
import {PanelExtensionContext, RenderState} from '@foxglove/studio'
import {useEffect, useLayoutEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import {GraphNode} from './types/GraphElements'
import type {
  CreateNode,
  CreatePublisher,
  CreateSubscription,
  DestroyNode,
  DestroyPublisher,
  DestroySubscription,
  NodeEvent,
} from './types/NodeEvents'
import type {Node, PubSub} from './types/RosEntities'
import type RosStdMsgString from './types/RosStdMsgsString'
import type Statistics from './types/Statistics'
import type {TopicHelper, TopicHelperMap} from './types/TopicHelper'

function SystemViewerPanel({context}: {context: PanelExtensionContext}): JSX.Element {
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>()
  const [nodes, setNodes] = useState<Node[]>([])
  const [publishers, setPublishers] = useState<PubSub[]>([])
  const [subscriptions, setSubscriptions] = useState<PubSub[]>([])

  const nodeEventsTopic = 'system_viewer/node_events'
  const statisticsTopic = 'system_viewer/statistics'

  function processFramesForNodeEvents(
    frames: readonly MessageEvent<unknown>[],
    nodes: Node[],
    publishers: PubSub[],
    subscriptions: PubSub[],
  ) {
    frames.forEach((frame) => {
      if (frame.topic === nodeEventsTopic) {
        const out = processNodeEventMessageEvent(frame, nodes, publishers, subscriptions)
        nodes = out.nodes
        publishers = out.publishers
        subscriptions = out.subscriptions
      }
    })
    setNodes(nodes)
    setPublishers(publishers)
    setSubscriptions(subscriptions)
  }

  function processFramesForStatistics(frames: readonly MessageEvent<unknown>[]) {
    frames.forEach((frame) => {
      if (frame.topic === statisticsTopic) {
        const messageEvent = frame as MessageEvent<RosStdMsgString>
        const msg = JSON.parse(messageEvent.message.data)
        handleStatisticsMessage(msg)
      }
    })
  }

  useLayoutEffect(() => {
    context.onRender = (renderState: RenderState, done) => {
      setRenderDone(done)

      if (renderState.previewTime && context.seekPlayback) {
        context.seekPlayback(renderState.previewTime)
        const timeObject = getTimeFromNumber(renderState.previewTime)
        const frames = getFramesBeforeTime(renderState.allFrames, timeObject)
        processFramesForNodeEvents(frames, [], [], [])
        processFramesForStatistics(frames)
      } else if (renderState.currentFrame && renderState.currentFrame.length > 0) {
        const currentFrames = renderState.currentFrame
        processFramesForNodeEvents(currentFrames, nodes, publishers, subscriptions)
        processFramesForStatistics(currentFrames)
      }
    }

    context.watch('currentFrame')
    context.watch('allFrames')
    context.watch('previewTime')
    context.subscribe([nodeEventsTopic, statisticsTopic])
  }, [])

  useEffect(() => {
    renderDone?.()
  }, [renderDone])

  return (
    <>
      <h1>System Viewer</h1>
      <h2>Nodes</h2>
      <ul>
        {nodes.map((node) => (
          <li key={node.name}>
            {node.name}
            <br />
            Publishers:
            <ul>
              {node.publisherIds.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
            Subscribers:
            <ul>
              {node.subscriptionIds.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <h2>Publishers</h2>
      <ul>
        {publishers.map((pub) => (
          <li key={pub.id}>{pub.id}</li>
        ))}
      </ul>
      <h2>Subscriptions</h2>
      <ul>
        {subscriptions.map((sub) => (
          <li key={sub.id}>{sub.id}</li>
        ))}
      </ul>
      <h2>Output</h2>
      <code>{JSON.stringify(toGraph(nodes, publishers, subscriptions))}</code>
    </>
  )
}

export function toGraph(nodes: Node[], publishers: PubSub[], subscriptions: PubSub[]) {
  // make nodes
  const graphNodes: GraphNode[] = nodes.map((node) => ({
    id: node.id,
    type: 'rosNode',
    isHidden: false,
    data: {
      namespace: node.namespace,
      label: node.name,
    },
  }))
  console.log(graphNodes)
  // make topics
  const topicHelperMap: TopicHelperMap = {}
  nodes.map((node) => {
    updateTopicHelperMap(topicHelperMap, node, publishers, true)
    updateTopicHelperMap(topicHelperMap, node, subscriptions, false)
  })
  // make edges between topics
  console.log('topic helper map: ', topicHelperMap)
  return topicHelperMap
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

function processNodeEventMessageEvent(
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
    nodes: [...nodes],
    publishers: [...publishers],
    subscriptions: [...subscriptions],
  } // to trigger react to update
}

function handleStatisticsMessage(msg: Statistics) {
  console.info('message on statistics topic: ', msg)
}

function getTimeFromNumber(num: number): Time {
  const seconds = Math.floor(num)
  const nanoseconds = Math.floor((num - seconds) * 1_000_000_000)
  return {sec: seconds, nsec: nanoseconds} as Time
}

function getFramesBeforeTime(frames: readonly MessageEvent<unknown>[] | undefined, time: Time) {
  const messages = frames?.filter((message) => compareTime(message.receiveTime, time) !== 1) ?? []
  return messages as MessageEvent<unknown>[]
}

function compareTime(time1: Time, time2: Time) {
  if (time1.sec < time2.sec) {
    return -1
  } else if (time1.sec > time2.sec) {
    return 1
  } else {
    if (time1.nsec < time2.nsec) {
      return -1
    } else if (time1.nsec > time2.nsec) {
      return 1
    } else {
      return 0
    }
  }
}

export function initSystemViewerPanel(context: PanelExtensionContext) {
  ReactDOM.render(<SystemViewerPanel context={context} />, context.panelElement)
}
