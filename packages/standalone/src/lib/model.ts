export type Vector = [number, number, number];

export type Vertex = {
  cs: Vector,
  i: number
}

export type Face = {
  vs: Vertex[],
  i: number,
  n?: Vector //normal,
  c?: Vector  //centroid,
  es?: any //edges
  ord?: any;
}

export type Edge = {
  raw?: any,
  v1: Vertex,
  v2: Vertex,
  as: string
}

export type EdgeMap = {[s: string]: Edge;}