import {Node, PubSub} from './RosEntities'

export type NodeEvent =
  | CreateNode
  | CreatePublisher
  | CreateSubscription
  | DestroyNode
  | DestroyPublisher
  | DestroySubscription

export type CreateNode = {
  name: 'create_node'
} & Node

export type CreatePublisher = {
  event: 'create_publisher'
} & PubSub

export type CreateSubscription = {
  event: 'create_subscription'
} & PubSub

export type DestroyNode = {
  event: 'destroy_node'
} & Pick<Node, 'id'>

export type DestroyPublisher = {
  event: 'destroy_publisher'
} & Pick<PubSub, 'id'>

export type DestroySubscription = {
  event: 'destroy_subscription'
} & Pick<PubSub, 'id'>
