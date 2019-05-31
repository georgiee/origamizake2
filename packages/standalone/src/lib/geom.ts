
const mod = function(a, b) { return (+a % (b = +b) + b) % b; };
let geom = {} as any;
const EPS = 0.000001;

export const sum = function(a, b) {
  return a + b;
};

export const min = function(a, b) {
  if (a < b) {
    return a;
  } else {
    return b;
  }
};

export const max = function(a, b) {
  if (a > b) {
    return a;
  } else {
    return b;
  }
};

export const all = function(a, b) {
  return a && b;
};

export const next = function(start, n, i = 1) {
  /*
  Returns the ith cyclic ordered number after start in the range [0..n].
   */
  return mod(start + i, n);
};

export const rangesDisjoint = function(arg, arg1) {
  var a1, a2, b1, b2, ref, ref1;
  a1 = arg[0], a2 = arg[1];
  b1 = arg1[0], b2 = arg1[1];
  return ((b1 < (ref = Math.min(a1, a2)) && ref > b2)) || ((b1 > (ref1 = Math.max(a1, a2)) && ref1 < b2));
};

export const topologicalSort = function(vs) {
  var k, l, len, len1, list, ref, v;
  for (k = 0, len = vs.length; k < len; k++) {
    v = vs[k];
    ref = [false, null], v.visited = ref[0], v.parent = ref[1];
  }
  list = [];
  for (l = 0, len1 = vs.length; l < len1; l++) {
    v = vs[l];
    if (!v.visited) {
      list = visit(v, list);
    }
  }
  return list;
};

export const visit = function(v, list) {
  var k, len, ref, u;
  v.visited = true;
  ref = v.children;
  for (k = 0, len = ref.length; k < len; k++) {
    u = ref[k];
    if (!(!u.visited)) {
      continue;
    }
    u.parent = v;
    list = visit(u, list);
  }
  return list.concat([v]);
};

export const magsq = function(a) {
  return dot(a, a);
};

export const mag = function(a) {
  return Math.sqrt(magsq(a));
};

export const unit = function(a, eps = EPS) {
  var length;
  length = magsq(a);
  if (length < eps) {
    return null;
  }
  return mul(a, 1 / mag(a));
};

export const ang2D = function(a, eps = EPS) {
  if (magsq(a) < eps) {
    return 0;
  }
  return Math.atan2(a[1], a[0]);
};

export const mul = function(a, s) {
  var i, k, len, results;
  results = [];
  for (k = 0, len = a.length; k < len; k++) {
    i = a[k];
    results.push(i * s);
  }
  return results;
};

export const linearInterpolate = function(t, a, b) {
  return plus(mul(a, 1 - t), mul(b, t));
};

export const plus = function(a, b) {
  var ai, i, k, len, results;
  results = [];
  for (i = k = 0, len = a.length; k < len; i = ++k) {
    ai = a[i];
    results.push(ai + b[i]);
  }
  return results;
};

export const sub = function(a, b) {
  return plus(a, mul(b, -1));
};

export const dot = function(a, b) {
  var ai, i;
  return ((function() {
    var k, len, results;
    results = [];
    for (i = k = 0, len = a.length; k < len; i = ++k) {
      ai = a[i];
      results.push(ai * b[i]);
    }
    return results;
  })()).reduce(sum);
};

export const distsq = function(a, b) {
  return magsq(sub(a, b));
};

export const dist = function(a, b) {
  return Math.sqrt(distsq(a, b));
};

export const closestIndex = function(a, bs) {
  var b, dist, i, k, len, minDist, minI;
  minDist = 2e308;
  for (i = k = 0, len = bs.length; k < len; i = ++k) {
    b = bs[i];
    if (minDist > (dist = dist(a, b))) {
      minDist = dist;
      minI = i;
    }
  }
  return minI;
};

export const dir = function(a, b) {
  return unit(sub(b, a));
};

export const ang = function(a, b) {
  var ref, ua, ub, v;
  ref = (function() {
    var k, len, ref, results;
    ref = [a, b];
    results = [];
    for (k = 0, len = ref.length; k < len; k++) {
      v = ref[k];
      results.push(unit(v));
    }
    return results;
  })(), ua = ref[0], ub = ref[1];
  if (!((ua != null) && (ub != null))) {
    return null;
  }
  return Math.acos(dot(ua, ub));
};

export const cross = function(a, b) {
  var i, j, ref, ref1;
  if ((a.length === (ref = b.length) && ref === 2)) {
    return a[0] * b[1] - a[1] * b[0];
  }
  if ((a.length === (ref1 = b.length) && ref1 === 3)) {
    return (function() {
      var k, len, ref2, ref3, results;
      ref2 = [[1, 2], [2, 0], [0, 1]];
      results = [];
      for (k = 0, len = ref2.length; k < len; k++) {
        ref3 = ref2[k], i = ref3[0], j = ref3[1];
        results.push(a[i] * b[j] - a[j] * b[i]);
      }
      return results;
    })();
  }
  return null;
};

export const parallel = function(a, b, eps) {
  var ref, ua, ub, v;
  if (eps == null) {
    eps = EPS;
  }
  ref = (function() {
    var k, len, ref, results;
    ref = [a, b];
    results = [];
    for (k = 0, len = ref.length; k < len; k++) {
      v = ref[k];
      results.push(unit(v));
    }
    return results;
  })(), ua = ref[0], ub = ref[1];
  if (!((ua != null) && (ub != null))) {
    return null;
  }
  return 1 - Math.abs(dot(ua, ub)) < eps;
};

export const rotate = function(a, u, t) {
  var ct, i, k, len, p, q, ref, ref1, results, st;
  u = unit(u);
  if (u == null) {
    return null;
  }
  ref = [Math.cos(t), Math.sin(t)], ct = ref[0], st = ref[1];
  ref1 = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
  results = [];
  for (k = 0, len = ref1.length; k < len; k++) {
    p = ref1[k];
    results.push(((function() {
      var l, len1, ref2, results1;
      ref2 = [ct, -st * u[p[2]], st * u[p[1]]];
      results1 = [];
      for (i = l = 0, len1 = ref2.length; l < len1; i = ++l) {
        q = ref2[i];
        results1.push(a[p[i]] * (u[p[0]] * u[p[i]] * (1 - ct) + q));
      }
      return results1;
    })()).reduce(sum));
  }
  return results;
};

export const interiorAngle = function(a, b, c) {
  var ang;
  ang = ang2D(sub(a, b)) - ang2D(sub(c, b));
  return ang + (ang < 0 ? 2 * Math.PI : 0);
};

export const turnAngle = function(a, b, c) {
  return Math.PI - interiorAngle(a, b, c);
};

export const triangleNormal = function(a, b, c) {
  return unit(cross(sub(b, a), sub(c, b)));
};

export const polygonNormal = function(points, eps = EPS) {
  var i, p;
  return unit(((function() {
    var k, len, results;
    results = [];
    for (i = k = 0, len = points.length; k < len; i = ++k) {
      p = points[i];
      results.push(cross(p, points[next(i, points.length)]));
    }
    return results;
  })()).reduce(plus), eps);
};

export const twiceSignedArea = function(points) {
  var i, v0, v1;
  return ((function() {
    var k, len, results;
    results = [];
    for (i = k = 0, len = points.length; k < len; i = ++k) {
      v0 = points[i];
      v1 = points[next(i, points.length)];
      results.push(v0[0] * v1[1] - v1[0] * v0[1]);
    }
    return results;
  })()).reduce(sum);
};

export const polygonOrientation = function(points) {
  return Math.sign(twiceSignedArea(points));
};

export const sortByAngle = function(points, origin, mapping) {
  if (origin == null) {
    origin = [0, 0];
  }
  if (mapping == null) {
    mapping = function(x) {
      return x;
    };
  }
  origin = mapping(origin);
  return points.sort(function(p, q) {
    var pa, qa;
    pa = ang2D(sub(mapping(p), origin));
    qa = ang2D(sub(mapping(q), origin));
    return pa - qa;
  });
};

export const segmentsCross = function(arg, arg1) {
  var p0, p1, q0, q1;
  p0 = arg[0], q0 = arg[1];
  p1 = arg1[0], q1 = arg1[1];
  if (rangesDisjoint([p0[0], q0[0]], [p1[0], q1[0]]) || rangesDisjoint([p0[1], q0[1]], [p1[1], q1[1]])) {
    return false;
  }
  return polygonOrientation([p0, q0, p1]) !== polygonOrientation([p0, q0, q1]) && polygonOrientation([p1, q1, p0]) !== polygonOrientation([p1, q1, q0]);
};

export const parametricLineIntersect = function(arg, arg1) {
  var denom, p1, p2, q1, q2;
  p1 = arg[0], p2 = arg[1];
  q1 = arg1[0], q2 = arg1[1];
  denom = (q2[1] - q1[1]) * (p2[0] - p1[0]) + (q1[0] - q2[0]) * (p2[1] - p1[1]);
  if (denom === 0) {
    return [null, null];
  } else {
    return [(q2[0] * (p1[1] - q1[1]) + q2[1] * (q1[0] - p1[0]) + q1[1] * p1[0] - p1[1] * q1[0]) / denom, (q1[0] * (p2[1] - p1[1]) + q1[1] * (p1[0] - p2[0]) + p1[1] * p2[0] - p2[1] * p1[0]) / denom];
  }
};

export const segmentIntersectSegment = function(s1, s2) {
  var ref, s, t;
  ref = parametricLineIntersect(s1, s2), s = ref[0], t = ref[1];
  if ((s != null) && ((0 <= s && s <= 1)) && ((0 <= t && t <= 1))) {
    return linearInterpolate(s, s1[0], s1[1]);
  } else {
    return null;
  }
};

export const lineIntersectLine = function(l1, l2) {
  var ref, s, t;
  ref = parametricLineIntersect(l1, l2), s = ref[0], t = ref[1];
  if (s != null) {
    return linearInterpolate(s, l1[0], l1[1]);
  } else {
    return null;
  }
};

export const pointStrictlyInSegment = function(p, s, eps) {
  var v0, v1;
  if (eps == null) {
    eps = EPS;
  }
  v0 = sub(p, s[0]);
  v1 = sub(p, s[1]);
  return parallel(v0, v1, eps) && dot(v0, v1) < 0;
};

export const centroid = function(points) {
  return mul(points.reduce(plus), 1.0 / points.length);
};

export const basis = function(ps, eps) {
  var d, ds, n, ns, p, x, y, z;
  if (eps == null) {
    eps = EPS;
  }
  if (((function() {
    var k, len, results;
    results = [];
    for (k = 0, len = ps.length; k < len; k++) {
      p = ps[k];
      results.push(p.length !== 3);
    }
    return results;
  })()).reduce(all)) {
    return null;
  }
  ds = (function() {
    var k, len, results;
    results = [];
    for (k = 0, len = ps.length; k < len; k++) {
      p = ps[k];
      if (distsq(p, ps[0]) > eps) {
        results.push(dir(p, ps[0]));
      }
    }
    return results;
  })();
  if (ds.length === 0) {
    return [];
  }
  x = ds[0];
  if (((function() {
    var k, len, results;
    results = [];
    for (k = 0, len = ds.length; k < len; k++) {
      d = ds[k];
      results.push(parallel(d, x, eps));
    }
    return results;
  })()).reduce(all)) {
    return [x];
  }
  ns = (function() {
    var k, len, results;
    results = [];
    for (k = 0, len = ds.length; k < len; k++) {
      d = ds[k];
      results.push(unit(cross(d, x)));
    }
    return results;
  })();
  ns = (function() {
    var k, len, results;
    results = [];
    for (k = 0, len = ns.length; k < len; k++) {
      n = ns[k];
      if (n != null) {
        results.push(n);
      }
    }
    return results;
  })();
  z = ns[0];
  y = cross(z, x);
  if (((function() {
    var k, len, results;
    results = [];
    for (k = 0, len = ns.length; k < len; k++) {
      n = ns[k];
      results.push(parallel(n, z, eps));
    }
    return results;
  })()).reduce(all)) {
    return [x, y];
  }
  return [x, y, z];
};

export const above = function(ps, qs, n, eps) {
  var pn, qn, ref, v, vs;
  if (eps == null) {
    eps = EPS;
  }
  ref = (function() {
    var k, len, ref, results;
    ref = [ps, qs];
    results = [];
    for (k = 0, len = ref.length; k < len; k++) {
      vs = ref[k];
      results.push((function() {
        var l, len1, results1;
        results1 = [];
        for (l = 0, len1 = vs.length; l < len1; l++) {
          v = vs[l];
          results1.push(dot(v, n));
        }
        return results1;
      })());
    }
    return results;
  })(), pn = ref[0], qn = ref[1];
  if (qn.reduce(max) - pn.reduce(min) < eps) {
    return 1;
  }
  if (pn.reduce(max) - qn.reduce(min) < eps) {
    return -1;
  }
  return 0;
};

export const separatingDirection2D = function(t1, t2, n, eps) {
  var i, j, k, l, len, len1, len2, m, o, p, q, ref, sign, t;
  if (eps == null) {
    eps = EPS;
  }
  ref = [t1, t2];
  for (k = 0, len = ref.length; k < len; k++) {
    t = ref[k];
    for (i = l = 0, len1 = t.length; l < len1; i = ++l) {
      p = t[i];
      for (j = o = 0, len2 = t.length; o < len2; j = ++o) {
        q = t[j];
        if (!(i < j)) {
          continue;
        }
        m = unit(cross(sub(p, q), n));
        if (m != null) {
          sign = above(t1, t2, m, eps);
          if (sign !== 0) {
            return mul(m, sign);
          }
        }
      }
    }
  }
  return null;
};

export const separatingDirection3D = function(t1, t2, eps) {
  var i, j, k, l, len, len1, len2, len3, m, o, p, q1, q2, r, ref, ref1, sign, x1, x2;
  if (eps == null) {
    eps = EPS;
  }
  ref = [[t1, t2], [t2, t1]];
  for (k = 0, len = ref.length; k < len; k++) {
    ref1 = ref[k], x1 = ref1[0], x2 = ref1[1];
    for (l = 0, len1 = x1.length; l < len1; l++) {
      p = x1[l];
      for (i = o = 0, len2 = x2.length; o < len2; i = ++o) {
        q1 = x2[i];
        for (j = r = 0, len3 = x2.length; r < len3; j = ++r) {
          q2 = x2[j];
          if (!(i < j)) {
            continue;
          }
          m = unit(cross(sub(p, q1), sub(p, q2)));
          if (m != null) {
            sign = above(t1, t2, m, eps);
            if (sign !== 0) {
              return mul(m, sign);
            }
          }
        }
      }
    }
  }
  return null;
};

export const circleCross = function(d, r1, r2) {
  var x, y;
  x = (d * d - r2 * r2 + r1 * r1) / d / 2;
  y = Math.sqrt(r1 * r1 - x * x);
  return [x, y];
};

export const creaseDir = function(u1, u2, a, b, eps) {
  var b1, b2, x, y, z, zmag;
  if (eps == null) {
    eps = EPS;
  }
  b1 = Math.cos(a) + Math.cos(b);
  b2 = Math.cos(a) - Math.cos(b);
  x = plus(u1, u2);
  y = sub(u1, u2);
  z = unit(cross(y, x));
  x = mul(x, b1 / magsq(x));
  y = mul(y, magsq(y) < eps ? 0 : b2 / magsq(y));
  zmag = Math.sqrt(1 - magsq(x) - magsq(y));
  z = mul(z, zmag);
  return [x, y, z].reduce(plus);
};

export const quadSplit = function(u, p, d, t) {
  if (magsq(p) > d * d) {
    throw new Error("STOP! Trying to split expansive quad.");
  }
  return mul(u, (d * d - magsq(p)) / 2 / (d * Math.cos(t) - dot(u, p)));
};


export const geo = geom;