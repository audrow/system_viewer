import type {MessageEvent, Time} from '@foxglove/studio'
import {PanelExtensionContext, RenderState} from '@foxglove/studio'
import {useEffect, useLayoutEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import type {
  CreateNode,
  CreatePublisher,
  CreateSubscription,
  DestroyNode,
  DestroyPublisher,
  DestroySubscription,
  NodeEvent,
} from './types/NodeEvents'
// import {processNewFrames, updateToTime} from './frame-utils'
import {Node, PubSub} from './types/RosEntities'
import type RosStdMsgString from './types/RosStdMsgsString'
import type Statistics from './types/Statistics'

function SystemViewerPanel({context}: {context: PanelExtensionContext}): JSX.Element {
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>()
  const [nodes, setNodes] = useState<Node[]>([])
  const [publishers, setPublishers] = useState<PubSub[]>([])
  const [subscriptions, setSubscriptions] = useState<PubSub[]>([])

  const nodeEventsTopic = 'system_viewer/node_events'
  const statisticsTopic = 'system_viewer/statistics'

  function processFrames(frames: readonly MessageEvent<unknown>[]) {
    frames.forEach((frame) => {
      if (frame.topic === nodeEventsTopic) {
        const messageEvent = frame as MessageEvent<RosStdMsgString>
        const msg = JSON.parse(messageEvent.message.data)
        const {
          nodes: newNodes,
          publishers: newPublishers,
          subscriptions: newSubscriptions,
        } = processNodeEventMessage(msg, nodes, publishers, subscriptions)
        setNodes(newNodes)
        setPublishers(newPublishers)
        setSubscriptions(newSubscriptions)
      } else if (frame.topic === statisticsTopic) {
        const messageEvent = frame as MessageEvent<RosStdMsgString>
        const msg = JSON.parse(messageEvent.message.data)
        handleStatisticsMessage(msg)
      } else {
        console.error('Unknown topic: ' + frame.topic)
      }
    })
  }

  useLayoutEffect(() => {
    context.onRender = (renderState: RenderState, done) => {
      setRenderDone(done)

      if (renderState.previewTime && context.seekPlayback) {
        // reset ros network
        setNodes([])
        setPublishers([])
        setSubscriptions([])

        context.seekPlayback(renderState.previewTime)
        const timeObject = getTimeFromNumber(renderState.previewTime)
        const frames = getFramesBeforeTime(renderState.allFrames, timeObject)
        processFrames(frames)
      } else if (renderState.currentFrame && renderState.currentFrame.length > 0) {
        const currentFrames = renderState.currentFrame
        processFrames(currentFrames)
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
    </>
  )
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
    nodes = nodes.filter((node) => node.id !== destroyNodeMsg.id)
  } else if (event === 'destroy_publisher') {
    const destroyPublisherMsg = msg as DestroyPublisher
    publishers = publishers.filter((pub) => pub.id !== destroyPublisherMsg.id)
  } else if (event === 'destroy_subscription') {
    const destroySubscriptionMsg = msg as DestroySubscription
    subscriptions = subscriptions.filter((sub) => sub.id !== destroySubscriptionMsg.id)
  } else {
    throw new Error(`Unknown message event: ${event}`)
  }

  // connect publishers and subscriptions to nodes
  nodes.forEach((node) => {
    const id = node.id
    node.publisherIds = publishers.filter((pub) => pub.node === id).map((pub) => pub.id)
    node.subscriptionIds = subscriptions.filter((sub) => sub.node === id).map((sub) => sub.id)
  })
  return {nodes: [...nodes], publishers: [...publishers], subscriptions: [...subscriptions]} // to trigger react to update
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
