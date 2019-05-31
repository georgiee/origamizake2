import { createdFaceEdges, createEdgeMap, parseFoldModel, createFaceOrder } from './make-model';
import { Face, Vertex } from './model';
import { SIMPLE_FOLD } from '../folding-examples/simple-fold';

describe('do it', () => {

  const rawEdges = [
    [0, 1],
    [1, 2],
  ]
  const rawAssignments = [
    'V', 'M'
  ]
  const vertices: Vertex[] = [
    { cs: [1, 0, 0], i: 0 },
    { cs: [0, 1, 1], i: 1 },
    { cs: [0, 0, 1], i: 2 }
  ];

  const face: Face = {
    vs: vertices,
    i: 0
  }

  test('createEdgeMap', () => {
    const map = createEdgeMap({vertices, edgesData: rawEdges, assignmentData: rawAssignments})
    expect(map).toMatchSnapshot();
  });

  test('createdFaceEdges', () => {
    const edgeMap = createEdgeMap({vertices, edgesData: rawEdges, assignmentData: rawAssignments})
    const faceEdges = createdFaceEdges(face, edgeMap);
    expect(faceEdges).toMatchSnapshot();
  })

  test('createdFaceEdges with no edgemap', () => {
    const edgeMap = {};
    const faceEdges = createdFaceEdges(face, edgeMap);
    expect(faceEdges).toMatchSnapshot();
  })

  test('createFaceOrders', () => {
    const parsedModel = parseFoldModel(SIMPLE_FOLD);
    parsedModel.faces.forEach(face => {
      createFaceOrder(face, SIMPLE_FOLD.faceOrders, parsedModel.faces);
    });

    expect(parsedModel.faces).toMatchSnapshot();
  })
})