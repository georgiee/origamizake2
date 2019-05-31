import { SIMPLE_FOLD } from './folding-examples/simple-fold';
// import { SQUARE_TWIST } from './folding-examples/square-twist';

import { makeModel } from './lib/make-model';
import { drawModel } from './lib/draw-model';


export function run() {
  console.log('rin3');

  const svg = document.getElementById('svgCanvas') as HTMLOrSVGElement;
  const model = makeModel(SIMPLE_FOLD);
  drawModel(model, svg);
}