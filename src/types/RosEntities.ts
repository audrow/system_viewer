export type Node = RosEntity & {
  name: string
  namespace: string
}

export type PubSub = RosEntity & {
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
  publishers: Id[]
  subscriptions: Id[]
}

type Id = string

type RosEntity = {
  id: Id
  domain: number
  hostname: string
  pid: number
  handle: string
}
