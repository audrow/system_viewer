export type Node = RosEntity & {
  name: string
  namespace: string
  publisherIds: Id[]
  subscriptionIds: Id[]
}

export type PubSub = RosEntity & {
  node: string
  topic: string
  qos: {
    history: number
    depth: number
    reliability: number
    durability: number
  }
}

export type Topic = {
  topic: string
  namespace: string
  publisherIds: Id[]
  subscriptionIds: Id[]
}

type Id = string

type RosEntity = {
  id: Id
  domain: number
  hostname: string
  pid: number
  handle: string
}
