# FOLD API

The FOLD API consists of several modules under the `FOLD` namespace:

* `FOLD.viewer`: Visualize FOLD format in browser in SVG
* `FOLD.filter`: Select existing parts of, or compute new features of,
  a given FOLD object.
* `FOLD.convert`: Augment an existing FOLD object with additional fields,
  and convert between FOLD and other file formats.
* `FOLD.file`: Load/save/convert files on file system (Node only, not browser)
* `FOLD.geom`: Basic geometry tools (manipulation of vectors, angles,
  lines, segments, etc.).  Basically whatever we needed to implement other
  features, but which you might find helpful too.

## FOLD.viewer

See [source code](https://github.com/edemaine/fold/blob/master/src/viewer.coffee)
for details.

## FOLD.filter

These operations all modify a FOLD object in-place.
See [source code](https://github.com/edemaine/fold/blob/master/src/filter.coffee)
for details.

* `FOLD.filter.subdivideCrossingEdges_vertices(fold, epsilon)`:
  Given a FOLD object with 2D `vertices_coords` and `edges_vertices`,
  subdivides all crossing/touching edges to form a planar graph.
  All duplicate and loop edges are also removed.
* `FOLD.filter.maybeAddVertex(fold, coords, epsilon)`:
  Given a FOLD object with `vertices_coords`, adds a new vertex with
  coordinates `coords` and returns its (last) index, unless there is already
  such a vertex within distance `epsilon`, in which case return the closest
  such vertex's index.  The new vertex has no new properties except
  `vertex_coords`.
* `FOLD.filter.addVertexAndSubdivide(fold, coords, epsilon)`:
  Given a FOLD object with 2D `vertices_coords` and `edges_vertices`,
  maybe adds a new vertex like `FOLD.filter.maybeAddVertex`, and then
  subdivides if necessary (via an efficient use of
  `FOLD.filter.subdivideCrossingEdges_vertices`).
* `FOLD.filter.addVertexLike(fold, oldVertexIndex)`:
  Given a FOLD object, adds a new vertex and copy all `vertex_...` attributes
  to be like the existing vertex `oldVertexIndex`.
  Returns the new vertex index.
* `FOLD.filter.addEdgeLike(fold, oldEdgeIndex, [v1, v2])`:
  Given a FOLD object with `edges_vertices`, adds a new edge connecting
  vertices `v1` and `v2`, and copy all other `edges_...` attributes to be like
  the existing edge `oldEdgeIndex`.  Returns the new edge index.
  If `v1` and/or `v2` are unspecified, the new edge inherits the same vertex
  connections as the old edge.
* `FOLD.filter.addEdgeAndSubdivide(fold, v1, v2, epsilon)`:
  Given a FOLD object with 2D `vertices_coords` and `edges_vertices`,
  adds an edge between vertex indices or points `v1` and `v2`
  (calling `FOLD.filter.addVertexAndSubdivide` when they are points),
  subdividing if necessary (via an efficient use of
  `FOLD.filter.subdivideCrossingEdges_vertices`).
  Returns two arrays: one with the indices of all the subdivided parts of the
  added edge, and the other with the indices of all other changed edges.
  The new edge(s) have no properties except `edges_vertices`, so the first
  array tells you which edges to set the properties of.
  If the edge is a loop, the returned arrays are empty.
  If the edge is a duplicate, the first array has the old edge index and the
  second array is empty.
* `FOLD.filter.cutEdges(fold, es)`:
  Given a FOLD object with `edges_vertices`, `edges_assignment`, and
  counterclockwise-sorted `vertices_edges`
  (see `FOLD.convert.edges_vertices_to_vertices_edges_sorted`),
  cuts apart ("unwelds") all edges in `es` into pairs of boundary edges.
  When an endpoint of a cut edge ends up on **n** boundaries,
  it splits into **n** vertices.
  Preserves above-mentioned properties (so you can then compute faces via
  `FOLD.convert.edges_vertices_to_faces_vertices_edges`),
  but ignores face properties and discards `vertices_vertices` if present.

## FOLD.convert

See [source code](https://github.com/edemaine/fold/blob/master/src/convert.coffee)
for details.

* `FOLD.convert.edges_vertices_to_vertices_vertices_unsorted(fold)`:
  Given a FOLD object with `edges_vertices` property (defining edge
  endpoints), automatically computes the `vertices_vertices` property.
  However, note that the `vertices_vertices` arrays will *not* be sorted
  in counterclockwise order.
* `FOLD.convert.edges_vertices_to_vertices_vertices_sorted(fold)`:
  Given a FOLD object with 2D `vertices_coords` and `edges_vertices` property
  (defining edge endpoints), automatically computes the `vertices_vertices`
  property and sorts them counterclockwise by angle in the plane.
* `FOLD.convert.edges_vertices_to_vertices_edges_sorted(fold)`:
  Given a FOLD object with 2D `vertices_coords` and `edges_vertices` property
  (defining edge endpoints), automatically computes the `vertices_edges`
  and `vertices_vertices` property and sorts them counterclockwise by angle
  in the plane.
* `FOLD.convert.sort_vertices_vertices(fold)`:
  Given a FOLD object with 2D `vertices_coords` and `vertices_vertices`
  properties, sorts each `vertices_vertices` array in counterclockwise
  order around the vertex in the plane.
* `FOLD.convert.vertices_vertices_to_faces_vertices(fold)`:
  Given a FOLD object with counterclockwise-sorted `vertices_vertices`
  property, constructs the implicitly defined faces, setting `faces_vertices`
  property.
* `FOLD.convert.vertices_edges_to_faces_vertices_edges(fold)`:
  Given a FOLD object with counterclockwise-sorted `vertices_edges` property,
  constructs the implicitly defined faces, setting both `faces_vertices`
  and `faces_edges` properties.  Handles multiple edges to the same vertex
  (unlike `FOLD.convert.vertices_vertices_to_faces_vertices`).
* `FOLD.convert.edges_vertices_to_faces_vertices(fold)`:
  Given a FOLD object with 2D `vertices_coords` and `edges_vertices`,
  computes a counterclockwise-sorted `vertices_vertices` property and
  constructs the implicitly defined faces, setting `faces_vertices` property.
* `FOLD.convert.edges_vertices_to_faces_vertices_edges(fold)`:
  Given a FOLD object with 2D `vertices_coords` and `edges_vertices`,
  computes counterclockwise-sorted `vertices_vertices` and `vertices_edges`
  properties and constructs the implicitly defined faces, setting
  both `faces_vertices` and `faces_edges` property.
* `FOLD.convert.vertices_vertices_to_vertices_edges(fold)`:
  Given a FOLD object with `vertices_vertices` and `edges_vertices`,
  fills in the corresponding `vertices_edges` property (preserving order).
* `FOLD.convert.faces_vertices_to_faces_edges(fold)`:
  Given a FOLD object with `faces_vertices` and `edges_vertices`,
  fills in the corresponding `faces_edges` property (preserving order).
* `FOLD.convert.faces_vertices_to_edges(fold)`:
  Given a FOLD object with just `faces_vertices`, automatically fills in
  `edges_vertices`, `edges_faces`, `faces_edges`, and `edges_assignment`.

Basic fold/JSON conversion:

* `FOLD.convert.toJSON(fold)`:
  Given a FOLD object, convert into a nicely formatted JSON string.
* `FOLD.convert.deepCopy(fold)`:
  Given a FOLD object, make a copy that shares no pointers with the original.

File format conversion (supported formats are `"fold"` and `"opx"`):

* `FOLD.convert.convertFromTo(data, fromFormat, toFormat)`: Convert the
  specified data from one format to another.
* `FOLD.convert.convertFrom(data, fromFormat)`: Convert the specified data
  from one format to FOLD.
* `FOLD.convert.convertTo(data, toFormat)`: Convert the specified data
  from FOLD to another format.
* The `FOLD.convert.oripa` submodule implements the conversion between FOLD and
  [ORIPA `.opx` format](http://mitani.cs.tsukuba.ac.jp/oripa/).  See
  [source code](https://github.com/edemaine/fold/blob/master/src/oripa.coffee)
  for details.


See [source code](https://github.com/edemaine/fold/blob/master/src/convert.coffee)
for details.

## FOLD.file

The following functions are available in Node only, not in the browser
(where filenames don't really make sense).

* `FOLD.file.toFile(fold, filename)`: Save FOLD object to specified
  filename, which can end in a supported extension (`.fold` or `.opx`).
* `FOLD.file.fileToFile(inFilename, outFilename)`: Convert one filename
  to another, using extensions to determine format.
  Alternatively, `outFilename` can be *just* an extension, in which case
  it will be combined with `inFilename` to form a full filename.

See [source code](https://github.com/edemaine/fold/blob/master/src/file.coffee)
for details.

## FOLD.geom

See [source code](https://github.com/edemaine/fold/blob/master/src/geom.coffee)
for details.