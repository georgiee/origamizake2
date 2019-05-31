import { SIMPLE_FOLD } from './simple-fold';
import { makeModel } from './lib/make-model';

function createSVGElement(tagName) {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}

function draw(svg: HTMLOrSVGElement) {
  console.log(svg);
  const face = createSVGElement('g');

}

export function run() {
  console.log('rin3');

  const svg = document.getElementById('svgCanvas') as HTMLOrSVGElement;
  const model = makeModel(SIMPLE_FOLD);
  console.log({model})
  draw(svg);
}