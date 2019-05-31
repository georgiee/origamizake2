import { SIMPLE_FOLD } from '../folding-examples/simple-fold';
import * as geo from './geom';
import { Edge, EdgeMap, Face, Vector, Vertex } from './model';

export function parseFoldModel({vertices_coords, faces_vertices, edges_vertices, edges_assignment}) {
  // create our vertices object
  const vertices: Vertex[] = vertices_coords.map((value, index) => ({cs: value, i: index} as Vertex));

  // create our faces object (to be enriched later with data)
  const faces: Face[] = faces_vertices.map((facesVerticesIndices, index) => {
    const faceVertices: Vertex[] = facesVerticesIndices.map(index => vertices[index]);
    return {vs: faceVertices, i: index} as Face;
  });

  // create our edges objects
  const edges = createEdgeMap({
    vertices,
    edgesData: edges_vertices,
    assignmentData: edges_assignment,
  });

  // enricht faces objects
  faces.forEach((face) => {
    face.n = createNormal(face);
    face.c = createCentroid(face);
    face.es = createdFaceEdges(face, edges);
    face.ord = {};
  });

  return {
    faces, edges, vertices,
  };
}

export function makeModel(data) {
  const parsedModel = parseFoldModel(data);

  if (data.faceOrders) {
    parsedModel.faces.forEach((face) => {
      createFaceOrder(face, data.faceOrders, parsedModel.faces);
    });
  }

  return parsedModel;
}

export function createFaceOrder(face, faceOrders, allFaces) {
  faceOrders.forEach(([f1, f2, order]) => {
    if(order !== 0  ) {
      const face1 = allFaces[f1];
      const face2 = allFaces[f2];

      if (geo.parallel(face1.n, face2.n)) {
        const normRel = geo.dot(face1.n, face2.n) > 0 ? 1 : -1;
        if (face1.ord['f' + f2] != null) {
          // tslint:disable-next-line: max-line-length
          // console.log('Warning: duplicate ordering input information for faces ' + f1 + ' and ' + f2 + '. Using first found in the faceOrder list.');
          if (face1.ord['f' + f2] !== order) {
            // tslint:disable-next-line: max-line-length
            // console.log('Error: duplicat ordering [' + f1 + ',' + f2 + ',' + order + '] is inconsistant with a previous entry.');
          }
        } else {
          face1.ord['f' + f2] = order;
          face2.ord['f' + f1] = -order * normRel;
        }
      } else {
        // console.log('Warning: order for non-parallel faces [' + f1 + ',' + f2 + ']');
      }
    }
  });
}

export function createdFaceEdges(f: Face, edgeMap: EdgeMap): Edge[] {
  const faceVertices = f.vs;
  const edges: Edge[] = faceVertices.map((vertex, index) => {
    const followingVertex = faceVertices[geo.next(index, faceVertices.length)];
    const [a, b] = vertex.i > followingVertex.i ? [followingVertex, vertex] : [vertex, followingVertex];
    const key = 'e' + a.i + 'e' + b.i;

    const defaultEdge = {
      v1: a,
      v2: b,
      as: 'U',
    };

    const edge = edgeMap[key] || defaultEdge;
    return edge;
  });

  return edges;
}
function createCentroid(face): Vector {
  const faceVertices = face.vs.map((vertex) => vertex.cs);
  return geo.centroid(faceVertices);
}

function createNormal(face): Vector {
  const faceVertices = face.vs.map((vertex) => vertex.cs);
  return geo.polygonNormal(faceVertices);
}

export function createEdgeMap(
    {vertices, edgesData, assignmentData}: {vertices: Vertex[], edgesData: any, assignmentData: any },
  ): EdgeMap {
  // TODO: Create edges if none are given
  const edges = (edgesData as any[]).reduce<EdgeMap>((edgesList: EdgeMap, [edgeVertex1, edgeVertex2], index) => {
    // TODO: Sort edgeVertex1, edgeVertex2 if given in wrong order
    const key = 'e' + edgeVertex1 + 'e' + edgeVertex2;
    const asssignment = assignmentData[index] || 'U';

    edgesList[key] = {
      raw: edgesData,
      v1: vertices[edgeVertex1],
      v2: vertices[edgeVertex2],
      as: asssignment,
    } as Edge;

    return edgesList;
  }, {});

  return edges;
}
