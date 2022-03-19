export type GraphNode = GraphElement & {
  type: 'rosNode'
}

export type GraphTopic = GraphElement & {
  type: 'rosTopic'
}

type GraphElement = GraphBase & {
  data: {
    namespace: string
    label: string
  }
  position?: {x: number; y: number}
  style?: {[key: string]: string | number}
}

export type GraphEdge = GraphBase & {
  type: 'default'
  source: string
  target: string
  animated: boolean
  arrowHeadType?: unknown
  label: string
  labelStyle?: {[key: string]: string | number}
  labelBgStyle?: {[key: string]: string | number}
}

type GraphBase = {
  id: string
  type: string
  isHidden: boolean
}
