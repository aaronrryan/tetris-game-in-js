// Tetromino shapes
export const TETROMINOES = {
  // I-piece
  'I': [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  // J-piece
  'J': [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0]
  ],
  // L-piece
  'L': [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0]
  ],
  // O-piece
  'O': [
    [4, 4],
    [4, 4]
  ],
  // S-piece
  'S': [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0]
  ],
  // T-piece
  'T': [
    [0, 6, 0],
    [6, 6, 6],
    [0, 0, 0]
  ],
  // Z-piece
  'Z': [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0]
  ]
};

// Colors for each tetromino
export const COLORS = [
  'transparent',  // 0 - empty
  '#00FFFF',      // 1 - I - Cyan
  '#0000FF',      // 2 - J - Blue
  '#FF8000',      // 3 - L - Orange
  '#FFFF00',      // 4 - O - Yellow
  '#00FF00',      // 5 - S - Green
  '#800080',      // 6 - T - Purple
  '#FF0000'       // 7 - Z - Red
];
