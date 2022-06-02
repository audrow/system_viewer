import type {MessageEvent} from '@foxglove/studio'
import {PanelExtensionContext, RenderState} from '@foxglove/studio'
import {useEffect, useLayoutEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import processNodeEventMessageEvent from './process-node-message-event'
import toGraph from './to-graph'
import {getFramesBeforeTime, getTimeFromNumber} from './utils/time'
import type {Node, PubSub} from './__types__/RosEntities'
import type RosStdMsgString from './__types__/RosStdMsgsString'
import type Statistics from './__types__/Statistics'

import ReactFlow, {useEdgesState, useNodesState} from 'react-flow-renderer'

// import './updatenode.css';

const initialNodes = [
  {id: '1', data: {label: '-'}, position: {x: 100, y: 100}},
  {id: '2', data: {label: 'Node 2'}, position: {x: 100, y: 200}},
]

const initialEdges = [{id: 'e1-2', source: '1', target: '2'}]

const UpdateNode = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const [nodeName, setNodeName] = useState('Node 1')
  const [nodeBg, setNodeBg] = useState('#eee')
  const [nodeHidden, setNodeHidden] = useState(false)

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '1') {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          node.data = {
            ...node.data,
            label: nodeName,
          }
        }

        return node
      }),
    )
  }, [nodeName, setNodes])

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '1') {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          node.style = {...node.style, backgroundColor: nodeBg}
        }

        return node
      }),
    )
  }, [nodeBg, setNodes])

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '1') {
          // when you update a simple type you can just update the value
          node.hidden = nodeHidden
        }

        return node
      }),
    )
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === 'e1-2') {
          edge.hidden = nodeHidden
        }

        return edge
      }),
    )
  }, [nodeHidden, setNodes, setEdges])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      defaultZoom={1.5}
      minZoom={0.2}
      maxZoom={4}
      attributionPosition="bottom-left"
    >
      <div className="updatenode__controls">
        <label>label:</label>
        <input value={nodeName} onChange={(evt) => setNodeName(evt.target.value)} />

        <label className="updatenode__bglabel">background:</label>
        <input value={nodeBg} onChange={(evt) => setNodeBg(evt.target.value)} />

        <div className="updatenode__checkboxwrapper">
          <label>hidden:</label>
          <input
            type="checkbox"
            checked={nodeHidden}
            onChange={(evt) => setNodeHidden(evt.target.checked)}
          />
        </div>
      </div>
    </ReactFlow>
  )
}

function SystemViewerPanel({context}: {context: PanelExtensionContext}): JSX.Element {
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>()
  const [nodes, setNodes] = useState<Node[]>([])
  const [publishers, setPublishers] = useState<PubSub[]>([])
  const [subscriptions, setSubscriptions] = useState<PubSub[]>([])

  const nodeEventsTopic = '/system_viewer/node_events'
  const statisticsTopic = '/system_viewer/statistics'

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
    // Copy to trigger a re-render in React
    setNodes([...nodes])
    setPublishers([...publishers])
    setSubscriptions([...subscriptions])
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
      <UpdateNode />
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

function handleStatisticsMessage(msg: Statistics) {
  console.info('message on statistics topic: ', msg)
}

export function initSystemViewerPanel(context: PanelExtensionContext) {
  ReactDOM.render(<SystemViewerPanel context={context} />, context.panelElement)
}
