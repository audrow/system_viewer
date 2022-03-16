export type Node = {
  name: string
  namespace: string
} & Entity

export type PubSub = {
  qos: {
    history: number
    depth: number
    reliability: number
    durability: number
  }
} & Entity

export type Topic = {
  name: string
  publishers: Id[]
  subscriptions: Id[]
}

type Id = string

type Entity = {
  id: Id
  domain: number
  hostname: string
  pid: number
  handle: string
}
