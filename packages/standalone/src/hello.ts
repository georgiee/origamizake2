import { MeshBuilder, ArcRotateCamera, Engine, HemisphericLight, Mesh, Scene, Vector3, VertexData } from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';
// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
import Earcut from "earcut";
console.log({Earcut})
export function hello() {
  return true;
}

class Model {
  private _vertices: any = [];

  addVertex(vertex) {
    this._vertices.push(vertex);
  }
}

const m = new Model();
m.addVertex([0, 0, 0]);
m.addVertex([400, 0, 0]);
m.addVertex([400, 400, 0]);
m.addVertex([0, 400, 0]);

export function build(canvas: HTMLCanvasElement) {
  const engine = new Engine(canvas);
  const scene = new Scene(engine);

  const camera = new ArcRotateCamera('Camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
  camera.setPosition(new Vector3(0, 0, 20));
  camera.attachControl(canvas, true);
  camera.attachControl(canvas, true);

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

  // Create a grid material
  const material = new GridMaterial('grid', scene);

  // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
  const sphere = Mesh.CreateSphere('sphere1', 16, 2, scene);
  sphere.position.y = 2;
  sphere.material = material;

  // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
  const ground = Mesh.CreateGround('ground1', 6, 6, 2, scene);
  ground.material = material;


  var customMesh = new Mesh("custom", scene);

  var positions = [-5, 2, -3, -7, -2, -3, -3, -2, -3, 5, 2, 3, 7, -2, 3, 3, -2, 3];
  var indices = [0, 1, 2, 3, 4, 5];

  var vertexData = new VertexData();

  vertexData.positions = positions;
  vertexData.indices = indices;

  vertexData.applyToMesh(customMesh);
  const shape = [
    new Vector3(4, 0, -4),
    new Vector3(2, 0, 0),
    new Vector3(5, 0, 2),
    new Vector3(1, 0, 2),
    new Vector3(-5, 0, 5),
    new Vector3(-3, 0, 1),
    new Vector3(-4, 0, -4),
    new Vector3(-2, 0, -3),
    new Vector3(2, 0, -3)
  ]

  const polygon = MeshBuilder.CreatePolygon("polygon", {shape: shape, sideOrientation: Mesh.DOUBLESIDE}, scene, Earcut);

  // Render every frame
  engine.runRenderLoop(() => {
      scene.render();
  });

  // scene.debugLayer.show();
}