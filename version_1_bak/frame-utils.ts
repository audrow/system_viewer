import {MessageEvent, Time} from '@foxglove/studio'
import type Node from './types/Node'
import {CreateNodeEvent, DestroyNodeEvent, NodeEvent} from './types/node-events'
import type RosStdMsgString from './types/RosStdMsgsString'
import type Topic from './types/Topic'
import {
  CreateTopicEvent,
  DestroyTopicEvent,
  TopicEvent,
  UpdateTopicEvent,
} from './types/topic-events'

export function processNewFrames(args: {
  frames: readonly MessageEvent<unknown>[]
  nodes: Node[]
  nodeEventsTopic: string
  topics: Topic[]
  topicEventsTopic: string
}): {nodes: Node[]; topics: Topic[]} {
  for (const frame of args.frames) {
    if (frame.topic === args.nodeEventsTopic) {
      args.nodes = updateNodesFromFrame(frame as MessageEvent<RosStdMsgString>, args.nodes)
    } else if (frame.topic === args.topicEventsTopic) {
      args.topics = updateTopicFromFrame(frame as MessageEvent<RosStdMsgString>, args.topics)
    } else {
      console.error(`Unknown topic ${frame.topic}`)
    }
  }
  return {nodes: args.nodes, topics: args.topics}
}

function updateNodesFromFrame(
  frame: MessageEvent<RosStdMsgString> | undefined,
  nodes: Node[],
): Node[] {
  const data = frame?.message.data
  if (!data) {
    return nodes
  }
  const parsedMessage: NodeEvent = JSON.parse(data)
  switch (parsedMessage.event) {
    case 'create':
      {
        const event = parsedMessage as CreateNodeEvent
        if (nodes.every((node) => node.id !== event.id)) {
          nodes.push({
            id: event.id,
            name: event.name,
            namespace: event.namespace,
          })
        }
      }
      break
    case 'destroy':
      {
        const event = parsedMessage as DestroyNodeEvent
        nodes.forEach((node, index) => {
          if (node.id === event.id) {
            nodes.splice(index, 1)
          }
        })
      }
      break
    default:
      console.error(`Unknown event ${parsedMessage.event}`)
  }
  // TODO: find a better way to update data, without making a copy
  // The [...nodes] makes a copy so react re-renders
  // there is probably a better way to do this
  return [...nodes]
}

function updateTopicFromFrame(
  frame: MessageEvent<RosStdMsgString> | undefined,
  topics: Topic[],
): Topic[] {
  const data = frame?.message.data
  if (!data) {
    return topics
  }
  const parsedMessage: TopicEvent = JSON.parse(data)
  switch (parsedMessage.event) {
    case 'create':
      {
        const event = parsedMessage as CreateTopicEvent
        if (topics.every((topic) => topic.id !== event.id)) {
          topics.push({
            id: event.id,
            sourceId: event.sourceId,
            destId: event.destId,
            topic: event.topic,
            data: event.data,
          })
        }
      }
      break
    case 'update':
      {
        const event = parsedMessage as UpdateTopicEvent
        topics.forEach((topic, index) => {
          if (topic.id === event.id) {
            topics[index]!.data = {
              ...topics[index]!.data,
              ...event.data,
            }
          }
        })
      }
      break
    case 'destroy':
      {
        const event = parsedMessage as DestroyTopicEvent
        topics.forEach((topic, index) => {
          if (topic.id === event.id) {
            topics.splice(index, 1)
          }
        })
      }
      break
    default:
      console.error(`Unknown event ${parsedMessage.event}`)
  }
  // TODO: find a better way to update data, without making a copy
  // The [...topics] makes a copy so react re-renders
  // there is probably a better way to do this
  return [...topics]
}

export function updateToTime(args: {
  time: number
  frames: readonly MessageEvent<unknown>[] | undefined
  nodeEventsTopic: string
  topicEventsTopic: string
}): {nodes: Node[]; topics: Topic[]} {
  const timeObject = getTimeFromNumber(args.time)
  const filteredFrames = getFramesBeforeTime(args.frames, timeObject)
  return processNewFrames({
    frames: filteredFrames,
    nodes: [],
    topics: [],
    nodeEventsTopic: args.nodeEventsTopic,
    topicEventsTopic: args.topicEventsTopic,
  })
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
