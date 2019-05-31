geom = require './geom'
filter = exports

filter.edgesAssigned = (fold, target) ->
  i for assignment, i in fold.edges_assignment when assignment == target
filter.mountainEdges = (fold) ->
  filter.edgesAssigned fold, 'M'
filter.valleyEdges = (fold) ->
  filter.edgesAssigned fold, 'V'
filter.flatEdges = (fold) ->
  filter.edgesAssigned fold, 'F'
filter.boundaryEdges = (fold) ->
  filter.edgesAssigned fold, 'B'
filter.unassignedEdges = (fold) ->
  filter.edgesAssigned fold, 'U'

filter.keysStartingWith = (fold, prefix) ->
  key for key of fold when key[...prefix.length] == prefix

filter.keysEndingWith = (fold, suffix) ->
  key for key of fold when key[-suffix.length..] == suffix

filter.remapField = (fold, field, old2new) ->
  ###
  old2new: null means throw away that object
  ###
  new2old = []
  for j, i in old2new  ## later overwrites earlier
    new2old[j] = i if j?
  for key in filter.keysStartingWith fold, "#{field}_"
    fold[key] = (fold[key][old] for old in new2old)
  for key in filter.keysEndingWith fold, "_#{field}"
    fold[key] = (old2new[old] for old in array for array in fold[key])
  fold

filter.remapFieldSubset = (fold, field, keep) ->
  id = 0
  old2new =
    for value in keep
      if value
        id++
      else
        null  ## remove
  filter.remapField fold, field, old2new
  old2new

filter.numType = (fold, type) ->
  ###
  Count the maximum number of objects of a given type, by looking at all
  fields with key of the form `type_...`, and if that fails, looking at all
  fields with key of the form `..._type`.  Returns `0` if nothing found.
  ###
  counts =
    for key in filter.keysStartingWith fold, "#{type}_"
      value = fold[key]
      continue unless value.length?
      value.length
  unless counts.length
    counts =
      for key in filter.keysEndingWith fold, "_#{type}"
        1 + Math.max fold[key]...
  if counts.length
    Math.max counts...
  else
    0  ## nothing of this type

filter.numVertices = (fold) -> filter.numType fold, 'vertices'
filter.numEdges = (fold) -> filter.numType fold, 'edges'
filter.numFaces = (fold) -> filter.numType fold, 'faces'

filter.removeDuplicateEdges_vertices = (fold) ->
  seen = {}
  id = 0
  old2new =
    for edge in fold.edges_vertices
      [v, w] = edge
      if v < w
        key = "#{v},#{w}"
      else
        key = "#{w},#{v}"
      unless key of seen
        seen[key] = id
        id += 1
      seen[key]
  filter.remapField fold, 'edges', old2new
  old2new

filter.edges_verticesIncident = (e1, e2) ->
  for v in e1
    if v in e2
      return v
  null

## Use hashing to find points within an epsilon > 0 distance from each other.
## Each integer cell will have O(1) distinct points before matching
## (number of disjoint half-unit disks that fit in a unit square).

class RepeatedPointsDS
  constructor: (@vertices_coords, @epsilon) ->
    ## Note: if vertices_coords has some duplicates in the initial state,
    ## then we will detect them but won't remove them here.  Rather,
    ## future duplicate inserts will return the higher-index vertex.
    @hash = {}
    for coord, v in @vertices_coords
      (@hash[@key coord] ?= []).push v
    null

  lookup: (coord) ->
    [x, y] = coord
    xr = Math.round(x / @epsilon)
    yr = Math.round(y / @epsilon)
    for xt in [xr, xr-1, xr+1]
      for yt in [yr, yr-1, yr+1]
        key = "#{xt},#{yt}"
        for v in @hash[key] ? []
          if @epsilon > geom.dist @vertices_coords[v], coord
            return v
    null

  key: (coord) ->
    [x, y] = coord
    xr = Math.round x / @epsilon
    yr = Math.round y / @epsilon
    key = "#{xr},#{yr}"

  insert: (coord) ->
    v = @lookup coord
    return v if v?
    (@hash[@key coord] ?= []).push v = @vertices_coords.length
    @vertices_coords.push coord
    v

filter.collapseNearbyVertices = (fold, epsilon) ->
  vertices = new RepeatedPointsDS [], epsilon
  old2new =
    for coords in fold.vertices_coords
      vertices.insert coords
  filter.remapField fold, 'vertices', old2new
  ## In particular: fold.vertices_coords = vertices.vertices_coords

filter.maybeAddVertex = (fold, coords, epsilon) ->
  ###
  Add a new vertex at coordinates `coords` and return its (last) index,
  unless there is already such a vertex within distance `epsilon`,
  in which case return the closest such vertex's index.
  ###
  i = geom.closestIndex coords, fold.vertices_coords
  if i? and epsilon >= geom.dist coords, fold.vertices_coords[i]
    i  ## Closest point is close enough
  else
    fold.vertices_coords.push(coords) - 1

filter.addVertexLike = (fold, oldVertexIndex) ->
  ## Add a vertex and copy data from old vertex.
  vNew = filter.numVertices fold
  for key in filter.keysStartingWith fold, 'vertices_'
    switch key[6..]
      when 'vertices'
        ## Leaving these broken
      else
        fold[key][vNew] = fold[key][oldVertexIndex]
  vNew

filter.addEdgeLike = (fold, oldEdgeIndex, v1, v2) ->
  ## Add an edge between v1 and v2, and copy data from old edge.
  ## If v1 or v2 are unspecified, defaults to the vertices of the old edge.
  ## Must have `edges_vertices` property.
  eNew = fold.edges_vertices.length
  for key in filter.keysStartingWith fold, 'edges_'
    switch key[6..]
      when 'vertices'
        fold.edges_vertices.push [
          v1 ? fold.edges_vertices[oldEdgeIndex][0]
          v2 ? fold.edges_vertices[oldEdgeIndex][1]
        ]
      when 'edges'
        ## Leaving these broken
      else
        fold[key][eNew] = fold[key][oldEdgeIndex]
  eNew

filter.addVertexAndSubdivide = (fold, coords, epsilon) ->
  v = filter.maybeAddVertex fold, coords, epsilon
  changedEdges = []
  if v == fold.vertices_coords.length - 1
    ## Similar to "Handle overlapping edges" case:
    for e, i in fold.edges_vertices
      continue if v in e  # shouldn't happen
      s = (fold.vertices_coords[u] for u in e)
      if geom.pointStrictlyInSegment coords, s  ## implicit epsilon
        #console.log coords, 'in', s
        iNew = filter.addEdgeLike fold, i, v, e[1]
        changedEdges.push i, iNew
        e[1] = v
  [v, changedEdges]

filter.removeLoopEdges = (fold) ->
  ###
  Remove edges whose endpoints are identical.  After collapsing via
  `filter.collapseNearbyVertices`, this removes epsilon-length edges.
  ###
  filter.remapFieldSubset fold, 'edges',
    for edge in fold.edges_vertices
      edge[0] != edge[1]

filter.subdivideCrossingEdges_vertices = (fold, epsilon, involvingEdgesFrom) ->
  ###
  Using just `vertices_coords` and `edges_vertices` and assuming all in 2D,
  subdivides all crossing/touching edges to form a planar graph.
  In particular, all duplicate and loop edges are also removed.

  If called without `involvingEdgesFrom`, does all subdivision in quadratic
  time.  xxx Should be O(n log n) via plane sweep.
  In this case, returns an array of indices of all edges that were subdivided
  (both modified old edges and new edges).

  If called with `involvingEdgesFrom`, does all subdivision involving an
  edge numbered `involvingEdgesFrom` or higher.  For example, after adding an
  edge with largest number, call with `involvingEdgesFrom =
  edges_vertices.length - 1`; then this will run in linear time.
  In this case, returns two arrays of edges: the first array are all subdivided
  from the "involved" edges, while the second array is the remaining subdivided
  edges.
  ###

  changedEdges = [[], []]
  addEdge = (v1, v2, oldEdgeIndex, which) ->
    #console.log 'adding', oldEdgeIndex, fold.edges_vertices.length, 'to', which
    eNew = filter.addEdgeLike fold, oldEdgeIndex, v1, v2
    changedEdges[which].push oldEdgeIndex, eNew

  ## Handle overlapping edges by subdividing edges at any vertices on them.
  ## We use a while loop instead of a for loop to process newly added edges.
  i = involvingEdgesFrom ? 0
  while i < fold.edges_vertices.length
    e = fold.edges_vertices[i]
    s = (fold.vertices_coords[u] for u in e)
    for p, v in fold.vertices_coords
      continue if v in e
      if geom.pointStrictlyInSegment p, s  ## implicit epsilon
        #console.log p, 'in', s
        addEdge v, e[1], i, 0
        e[1] = v
    i++

  ## Handle crossing edges
  ## We use a while loop instead of a for loop to process newly added edges.
  vertices = new RepeatedPointsDS fold.vertices_coords, epsilon
  i1 = involvingEdgesFrom ? 0
  while i1 < fold.edges_vertices.length
    e1 = fold.edges_vertices[i1]
    s1 = (fold.vertices_coords[v] for v in e1)
    for e2, i2 in fold.edges_vertices[...i1]
      s2 = (fold.vertices_coords[v] for v in e2)
      if not filter.edges_verticesIncident(e1, e2) and geom.segmentsCross s1, s2
        ## segment intersection is too sensitive a test;
        ## segmentsCross more reliable
        #cross = segmentIntersectSegment s1, s2
        cross = geom.lineIntersectLine s1, s2
        continue unless cross?
        crossI = vertices.insert cross
        #console.log e1, s1, 'intersects', e2, s2, 'at', cross, crossI
        unless crossI in e1 and crossI in e2  ## don't add endpoint again
          #console.log e1, e2, '->'
          unless crossI in e1
            addEdge crossI, e1[1], i1, 0
            e1[1] = crossI
            s1[1] = fold.vertices_coords[crossI] # update for future iterations
            #console.log '->', e1, fold.edges_vertices[fold.edges_vertices.length-1]
          unless crossI in e2
            addEdge crossI, e2[1], i2, 1
            e2[1] = crossI
            #console.log '->', e2, fold.edges_vertices[fold.edges_vertices.length-1]
    i1++

  old2new = filter.removeDuplicateEdges_vertices fold
  for i in [0, 1]
    changedEdges[i] = (old2new[e] for e in changedEdges[i])
  old2new = filter.removeLoopEdges fold
  for i in [0, 1]
    changedEdges[i] = (old2new[e] for e in changedEdges[i])

  #fold
  if involvingEdgesFrom?
    changedEdges
  else
    changedEdges[0].concat changedEdges[1]

filter.addEdgeAndSubdivide = (fold, v1, v2, epsilon) ->
  ###
  Add an edge between vertex indices or points `v1` and `v2`, subdivide
  as necessary, and return two arrays: all the subdivided parts of this edge,
  and all the other edges that change.
  If the edge is a loop or a duplicate, both arrays will be empty.
  ###
  if v1.length?
    [v1, changedEdges1] = filter.addVertexAndSubdivide fold, v1, epsilon
  if v2.length?
    [v2, changedEdges2] = filter.addVertexAndSubdivide fold, v2, epsilon
  if v1 == v2  ## Ignore loop edges
    return [[], []]
  for e, i in fold.edges_vertices
    if (e[0] == v1 and e[1] == v2) or
       (e[0] == v2 and e[1] == v1)
      return [[i], []]  ## Ignore duplicate edges
  iNew = fold.edges_vertices.push([v1, v2]) - 1
  if iNew
    changedEdges = filter.subdivideCrossingEdges_vertices(fold, epsilon, iNew)
    changedEdges[0].push iNew unless iNew in changedEdges[0]
  else
    changedEdges = [[iNew], []]
  changedEdges[1].push changedEdges1... if changedEdges1?
  changedEdges[1].push changedEdges2... if changedEdges2?
  changedEdges

filter.cutEdges = (fold, es) ->
  ###
  Given a FOLD object with `edges_vertices`, `edges_assignment`, and
  counterclockwise-sorted `vertices_edges`
  (see `FOLD.convert.edges_vertices_to_vertices_edges_sorted`),
  cuts apart ("unwelds") all edges in `es` into pairs of boundary edges.
  When an endpoint of a cut edge ends up on n boundaries,
  it splits into n vertices.
  Preserves above-mentioned properties (so you can then compute faces via
  `FOLD.convert.edges_vertices_to_faces_vertices_edges`),
  but ignores face properties and discards `vertices_vertices` if present.
  ###
  vertices_boundaries = []
  for e in filter.boundaryEdges fold
    for v in fold.edges_vertices[e]
      (vertices_boundaries[v] ?= []).push e
  for e1 in es
    ## Split e1 into two edges {e1, e2}
    e2 = filter.addEdgeLike fold, e1
    for v, i in fold.edges_vertices[e1]
      ve = fold.vertices_edges[v]
      ve.splice ve.indexOf(e1) + i, 0, e2
    ## Check for endpoints of {e1, e2} to split, when they're on the boundary
    for v1, i in fold.edges_vertices[e1]
      u1 = fold.edges_vertices[e1][1-i]
      u2 = fold.edges_vertices[e2][1-i]
      boundaries = vertices_boundaries[v1]?.length
      if boundaries >= 2  ## vertex already on boundary
        if boundaries > 2
          throw new Error "#{vertices_boundaries[v1].length} boundary edges at vertex #{v1}"
        [b1, b2] = vertices_boundaries[v1]
        neighbors = fold.vertices_edges[v1]
        i1 = neighbors.indexOf b1
        i2 = neighbors.indexOf b2
        if i2 == (i1+1) % neighbors.length
          neighbors = neighbors[i2..].concat neighbors[..i1] unless i2 == 0
        else if i1 == (i2+1) % neighbors.length
          neighbors = neighbors[i1..].concat neighbors[..i2] unless i1 == 0
        else
          throw new Error "Nonadjacent boundary edges at vertex #{v1}"
        ## Find first vertex among e1, e2 among neighbors, so other is next
        ie1 = neighbors.indexOf e1
        ie2 = neighbors.indexOf e2
        ie = Math.min ie1, ie2
        fold.vertices_edges[v1] = neighbors[..ie]
        v2 = filter.addVertexLike fold, v1
        fold.vertices_edges[v2] = neighbors[1+ie..]
        #console.log "Split #{neighbors} into #{fold.vertices_edges[v1]} for #{v1} and #{fold.vertices_edges[v2]} for #{v2}"
        for neighbor in fold.vertices_edges[v2] # including e2
          ev = fold.edges_vertices[neighbor]
          ev[ev.indexOf v1] = v2
    fold.edges_assignment?[e1] = 'B'
    fold.edges_assignment?[e2] = 'B'
    for v, i in fold.edges_vertices[e1]
      (vertices_boundaries[v] ?= []).push e1
    for v, i in fold.edges_vertices[e2]
      (vertices_boundaries[v] ?= []).push e2
  delete fold.vertices_vertices # would be out-of-date
  fold

filter.edges_vertices_to_vertices_vertices = (fold) ->
  ###
  Works for abstract structures, so NOT SORTED.
  Use sort_vertices_vertices to sort in counterclockwise order.
  ###
  numVertices = filter.numVertices fold
  vertices_vertices = ([] for v in [0...numVertices])
  for edge in fold.edges_vertices
    [v, w] = edge
    while v >= vertices_vertices.length
      vertices_vertices.push []
    while w >= vertices_vertices.length
      vertices_vertices.push []
    vertices_vertices[v].push w
    vertices_vertices[w].push v
  vertices_vertices