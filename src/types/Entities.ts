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

type Entity = {
  id: string
  domain: number
  hostname: string
  pid: number
  handle: string
}