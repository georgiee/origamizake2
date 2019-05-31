import { SIMPLE_FOLD } from './simple-fold';
import * as geoMath from './math';

class Camera {
  public c = [0,0,0];
  public x = [1,0,0];
  public y = [1,0,0];
  public z = [1,0,0];
  public r = 1;
}
class Model {
  private _vertices: any = [];
  private _faceIndices: any = [];
  private _faces: any = [];
  constructor(vertices, faceIndices) {
    this._vertices = [...vertices];
    this._faceIndices = [...faceIndices];

    this.update();
  }

  update() {
    const faces = this._faceIndices.map(indices => {
      const result =  indices.map(index => this._vertices[index])
      return result;
    })

    this._faces = faces;
  }

  get faces() {
    return this._faces;
  }
}

function createSVGElement(element): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', element);
}

function project() {
  console.log(geoMath.plus([0,0,0], [1,2,3]));
}

export function run() {
  console.log('run2', SIMPLE_FOLD);
  const fold = SIMPLE_FOLD;
  const model = new Model(fold.vertices_coords, fold.faces_vertices);

  const svg = document.getElementById('svgCanvas') as any;
  const test = createSVGElement('circle');
  test.setAttribute('fill', 'red');
  test.setAttribute('r', '10');
  test.setAttribute('cx', '50');
  test.setAttribute('cy', '50');
  svg.appendChild(test);

  project();
  const camera = new Camera();

  const faces = model.faces;
  faces.forEach((faces, index) => {
    const group = createSVGElement('g');
    group.setAttribute('class', 'face');

    const path = createSVGElement('path');
    const text = createSVGElement('text');
    // text.innerHTML = `face-${index}`
    group.appendChild(path);
    group.appendChild(text);
    svg.appendChild(group);
  })
}