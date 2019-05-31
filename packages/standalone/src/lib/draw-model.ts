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

export function update(model, svg) {
  const faces = model.faces;
  const vertices = model.vertices;
  vertices.forEach(vertex => {
    vertex.ps = proj(vertex.cs, camera);
  });


  faces.forEach(face => {
    face.c2 = proj(face.c, camera);
  });

  orderFaces(model, svg);

  faces.forEach(face => {
    const vertices = face.vs;
    const verticesProjected = vertices;
    const pathData = makePath(verticesProjected.map(vertex => vertex.ps));
    face.path.setAttribute('d', pathData);

    face.text.setAttribute('x', face.c2[0]);
    face.text.setAttribute('y', face.c2[1]);

    const isTop = geo.dot(face.n, camera.z) > 0;
    face.path.classList.toggle('origami-face--top', isTop === true);
    face.path.classList.toggle('origami-face--bottom', isTop === false);

    face.es.forEach((edge, index) => {
      const edgeElement = face.eg[index];
      const pathData = makePath([edge.v1.ps, edge.v2.ps]);
      edgeElement.setAttribute('d', pathData);
      const classes = [
        'origami-edge',
        'origami-edge--direction-' + edge.as
      ];
      edgeElement.setAttribute('class', classes.join(' '));
    });

    face.vs.forEach((vertex, index) => {
      const circle = face.vg[index].path;
      const text = face.vg[index].text;
      const [x, y] = vertex.ps;

      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      text.setAttribute('x', x);
      text.setAttribute('y', y);
    })
  });


}

function faceAbove(f1, f2, n) {
  const projectedVertices1 = f1.vs.map(vertex => vertex.ps);
  const projectedVertices2 = f2.vs.map(vertex => vertex.ps);

  const sepDir = geo.separatingDirection2D(projectedVertices1, projectedVertices2, [0, 0, 1]);

  const v1 = f1.vs.map(vertex => vertex.cs);
  const v2 = f2.vs.map(vertex => vertex.cs);

  if (sepDir != null) {
    return null;
  }

  const basis = geo.basis(v1.concat(v2));

  if (basis === null) {
    return null;
  }

  if (basis.length === 3) {
    const dir = geo.separatingDirection3D(v1, v2);
    if (dir != null) {
      return 0 > geo.dot(n, dir);
    } else {
      console.log('Warning: faces ' + f1.i + ' and ' + f2.i + ' properly intersect. Ordering is unresolved.');
    }
  }
  if (basis.length === 2) {
    const ord = f1.ord['f' + f2.i];
    if (ord != null) {
      return 0 > geo.dot(f2.n, n) * ord;
    }
  }

  return null;
}

function orderFaces(model, svg) {
  const faces = model.faces;
  const direction = geo.mul(camera.z, -1);
  faces.forEach(face => face.children = []);

  // go over all face to face variants
  // and check which one is above
  for (let i = 0; i< faces.length; i++) {
    let f1 = faces[i];
    for (let j = i; j < faces.length; j++) {
      const f2 = faces[j];
      const f1_above = faceAbove(f1, f2, direction);

      if (f1_above != null) {
        if (f1_above) {
          f1.children.push(f2);
        } else{
          f2.children.push(f1);
        }
      }
    }
  }

  // sort and then append in new order to reflect correct depth
  model.faces = geo.topologicalSort(faces);
  model.faces.forEach(face => {
    svg.appendChild(face.g);
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
  const t = 'translate(0,0.01)';
  const faces = model.faces;



  faces.forEach(face => {
    const faceGroup = createSVGElement('g');
    faceGroup.setAttribute('class', 'facegroup');
    face.g = faceGroup;

    // draw face
    const path = createSVGElement('path');
    faceGroup.appendChild(path);
    path.setAttribute('class', 'origami-face');
    face.path = path;

    // face label
    const faceText = createSVGElement('text');
    faceText.setAttribute('class', 'origami-face__text')
    faceText.innerHTML = 'f' + face.i;
    face.text = faceText;
    faceGroup.appendChild(faceText);

    // draw edges
    face.eg = [];
    face.es.forEach((edge, index) => {
      const path = createSVGElement('path');
      path.setAttribute('class', 'origami-edge');
      faceGroup.appendChild(path);
      face.eg[index] = path;
    });

    // draw vertices
    face.vg = [];
    face.vs.forEach((vertex, index) => {

      const vertextGroup = createSVGElement('g');
      vertextGroup.classList.add('origami-vertex');

      const circle = createSVGElement('circle');
      circle.classList.add('origami-vertex__circle');
      vertextGroup.appendChild(circle);

      const text = createSVGElement('text');
      text.classList.add('origami-vertex__text');
      text.innerHTML = vertex.i;
      vertextGroup.appendChild(text);

      face.vg[index] = vertextGroup;
      face.vg[index].path = circle;
      face.vg[index].text = text;

      face.g.appendChild(vertextGroup);
    });

    svg.appendChild(faceGroup)

  });

  update(model, svg);

  svg.addEventListener('mousedown', event => {
    rotateCam([event.clientX, event.clientY]);
    update(model, svg);

    camera.last = [event.clientX, event.clientY];
  });

  svg.addEventListener('mouseup', event => {
    rotateCam([event.clientX, event.clientY]);
    update(model, svg);

    camera.last = null;
  });

  svg.addEventListener('mousemove', event => {
    rotateCam([event.clientX, event.clientY]);
    update(model, svg);
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
      results.push((i === 0 ? 'M' : 'L') + ' ' + c[0] + ' ' + c[1] + ' ');
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