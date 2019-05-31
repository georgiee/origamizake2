export const SIMPLE_FOLD = {
  "file_spec": 1,
  "file_creator": "A text editor",
  "file_author": "Jason Ku",
  "file_classes": ["singleModel"],
  "frame_title": "Three-fold 3D example",
  "frame_classes": ["foldedForm"],
  "frame_attributes": ["3D"],
  "vertices_coords": [
    [0,1,0],
    [0,0,1],
    [0,-1,0],
    [1,0,0],
    [0,0,-1],
    [0,0,-1]
  ],
  "faces_vertices": [
    [0,1,2],
    [0,2,3],
    [0,4,1],
    [1,5,2]
  ],
  "edges_vertices": [
    [0,2],
    [0,1],
    [1,2],
    [2,3],
    [0,3],
    [1,4],
    [1,5],
    [0,4],
    [2,5]
  ],
  "edges_assignment": [
    "V",
    "M",
    "M",
    "B",
    "B",
    "B",
    "B",
    "B",
    "B"
  ],
  "faceOrders": [
    [2,0,-1],
    [3,0,-1]
  ]
}
