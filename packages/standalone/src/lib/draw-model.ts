import * as geo from './geom';
import { VertexBuffer } from '@babylonjs/core';

const camera = {
  c: [0, 0, 0],
  x: [1, 0, 0],
  y: [0, 1, 0],
  z: [0, 0, 1],
  r: 1,
  last: null,
  show: {
    'Faces': true,
    'Edges': true,
    'Vertices': false,
    'Face Text': false
  }
} as any;

function createSVGElement(tagName) {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}

export function update(model) {
  const faces = model.faces;
  const vertices = model.vertices;
  vertices.forEach(vertex => {
    vertex.ps = proj(vertex.cs, camera);
  });

  faces.forEach(face => {
    const vertices = face.vs;
    const verticesProjected = vertices;
    const pathData = makePath(verticesProjected.map(vertex => vertex.ps));
    face.path.setAttribute('d', pathData)
  });
}

export function drawModel(model, svg) {
  console.log('draw model', model);

  const minVector = min(model);
  const maxVector = max(model);

  // center of the camera
  camera.c = geo.mul(geo.plus(minVector, maxVector), 0.5);
  camera.r = geo.mag(geo.sub(maxVector, minVector)) / 2 * 1.05;
  const c = proj(camera.c, camera);
  const t = "translate(0,0.01)";
  const faces = model.faces;



  faces.forEach(face => {
    const faceGroup = createSVGElement('g');
    faceGroup.setAttribute('class', 'facegroup');
    face.g = faceGroup;

    const path = createSVGElement('path');
    faceGroup.appendChild(path);
    path.setAttribute('class', 'face');
    face.path = path;

    face.eg = [];
    face.es.forEach((edge, index) => {
      const path = createSVGElement('path');
      path.setAttribute('class', 'edge');
      faceGroup.appendChild(path);
      face.eg[index] = path;
    });

    svg.appendChild(faceGroup)

  });

  update(model);

  svg.addEventListener('mousedown', event => {
    rotateCam([event.clientX, event.clientY]);
    update(model);

    camera.last = [event.clientX, event.clientY];
  });

  svg.addEventListener('mouseup', event => {
    rotateCam([event.clientX, event.clientY]);
    update(model);

    camera.last = null;
  });

  svg.addEventListener('mousemove', event => {
    rotateCam([event.clientX, event.clientY]);
    update(model);
  });

}

function rotateCam(p) {
  const cam = camera;
  if (cam.last == null) {
    return;
  }
  const d = geo.sub(p, cam.last);
  if (!(geo.mag(d) > 0)) {
    return;
  }

  const u = geo.unit(geo.plus(geo.mul(cam.x, -d[1]), geo.mul(cam.y, -d[0])));
  const newX = geo.rotate(cam.x, u, geo.mag(d) * 0.01);
  const newY =   geo.rotate(cam.y, u, geo.mag(d) * 0.01);
  setCamXY(camera, newX, newY);
  cam.last = p;
}

function setCamXY(camera, x, y) {
  camera.x = x, camera.y = y, camera.z = geo.cross(x, y)
};


function makePath(coords) {
  var c, i;
  return ((function() {
    var l, len, results;
    results = [];
    for (i = l = 0, len = coords.length; l < len; i = ++l) {
      c = coords[i];
      results.push((i === 0 ? 'M' : 'L') + " " + c[0] + " " + c[1] + " ");
    }
    return results;
  })()).reduce(geo.sum);
};

function proj(p, cam) {
  var q;
  q = geo.mul(geo.sub(p, cam.c), 1 / cam.r);
  return [geo.dot(q, cam.x), -geo.dot(q, cam.y), 0];
};


function transposeVertices(vertices) {
  const vectorComponents = [0, 1, 2];
  return  vectorComponents.map(dimension => {
    return vertices.map(vertex => vertex.cs[dimension]);
  });
}
// the the minimum over all dimensions (x,y,z,...) -> Math.min(x1, x2, x3)
function min(model) {
  return transposeVertices(model.vertices).map(components => {
    return Math.min(...components)
  });
}

// the the maximum over all dimensions (x,y,z,...) -> Math.max(x1, x2, x3)
function max(model) {
  return transposeVertices(model.vertices).map(components => {
    return Math.max(...components)
  });
}