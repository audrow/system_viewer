import type {MessageEvent} from '@foxglove/studio'
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

  useLayoutEffect(() => {
    context.onRender = (renderState: RenderState, done) => {
      setRenderDone(done)

      if (renderState.previewTime && context.seekPlayback) {
        context.seekPlayback(renderState.previewTime)
        // const {nodes: newNodes, topics: newTopics} = updateToTime({
        //   time: renderState.previewTime,
        //   frames: renderState.allFrames,
        //   nodeEventsTopic,
        //   topicEventsTopic: statisticsTopic,
        // })
        // setNodes(newNodes)
      } else if (renderState.currentFrame && renderState.currentFrame.length > 0) {
        console.log(renderState.currentFrame)
        const currentFrames = renderState.currentFrame
        currentFrames.forEach((frame) => {
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
        // const {nodes: newNodes, topics: newTopics} = processNewFrames({
        //   frames: renderState.currentFrame,
        //   nodes,
        //   topics,
        //   nodeEventsTopic,
        //   topicEventsTopic: statisticsTopic,
        // })
        // setNodes(newNodes)
        // setTopics(newTopics)
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
          <li key={node.name}>{node.name}</li>
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
  if (event === 'create_node') {
    const createNodeMsg = msg as CreateNode
    console.log(`Creating node ${createNodeMsg.name}`)
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
  return {nodes: [...nodes], publishers: [...publishers], subscriptions: [...subscriptions]} // to trigger react to update
}

function handleStatisticsMessage(msg: Statistics) {
  console.log('message on statistics topic: ', msg)
}

export function initSystemViewerPanel(context: PanelExtensionContext) {
  ReactDOM.render(<SystemViewerPanel context={context} />, context.panelElement)
}
