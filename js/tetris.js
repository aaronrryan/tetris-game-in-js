import { TETROMINOES, COLORS } from './tetrominoes.js';

export class Tetris {
  constructor() {
    // Main game canvas
    this.canvas = document.getElementById('tetris');
    this.ctx = this.canvas.getContext('2d');
    
    // Next piece preview canvas
    this.nextCanvas = document.getElementById('next-piece');
    this.nextCtx = this.nextCanvas.getContext('2d');
    
    // Game board dimensions
    this.ROWS = 20;
    this.COLS = 10;
    this.BLOCK_SIZE = 30;
    
    // Game state
    this.board = this.createBoard();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.isPaused = false;
    this.dropCounter = 0;
    this.dropInterval = 1000; // Initial drop speed in ms
    this.lastTime = 0;
    this.animationId = null;
    
    // Current and next piece
    this.currentPiece = null;
    this.nextPiece = null;
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  createBoard() {
    return Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
  }
  
  setupEventListeners() {
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
  }
  
  handleKeyPress(event) {
    if (this.gameOver) return;
    
    if (event.key === 'p' || event.key === 'P') {
      this.togglePause();
      return;
    }
    
    if (this.isPaused) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        this.moveLeft();
        break;
      case 'ArrowRight':
        this.moveRight();
        break;
      case 'ArrowDown':
        this.moveDown();
        break;
      case 'ArrowUp':
        this.rotate();
        break;
      case ' ':
        this.hardDrop();
        break;
    }
  }
  
  togglePause() {
    this.isPaused = !this.isPaused;
    if (!this.isPaused) {
      this.lastTime = performance.now();
      this.update();
    }
  }
  
  start() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Reset game state
    this.board = this.createBoard();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.isPaused = false;
    this.dropInterval = 1000;
    
    // Update UI
    document.getElementById('score').textContent = this.score;
    document.getElementById('lines').textContent = this.lines;
    document.getElementById('level').textContent = this.level;
    
    // Create first pieces
    this.currentPiece = this.createPiece();
    this.nextPiece = this.createPiece();
    
    // Start game loop
    this.lastTime = performance.now();
    this.update();
  }
  
  update(time = performance.now()) {
    if (this.gameOver || this.isPaused) return;
    
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    
    this.dropCounter += deltaTime;
    if (this.dropCounter > this.dropInterval) {
      this.moveDown();
    }
    
    this.draw();
    this.animationId = requestAnimationFrame(this.update.bind(this));
  }
  
  draw() {
    // Clear canvases
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    
    // Draw board
    this.drawBoard();
    
    // Draw current piece
    this.drawPiece(this.ctx, this.currentPiece);
    
    // Draw next piece in preview
    this.drawNextPiece();
  }
  
  drawBoard() {
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        if (this.board[row][col]) {
          this.drawBlock(this.ctx, col, row, this.board[row][col]);
        }
      }
    }
    
    // Draw grid lines
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let col = 0; col <= this.COLS; col++) {
      this.ctx.beginPath();
      this.ctx.moveTo(col * this.BLOCK_SIZE, 0);
      this.ctx.lineTo(col * this.BLOCK_SIZE, this.ROWS * this.BLOCK_SIZE);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let row = 0; row <= this.ROWS; row++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, row * this.BLOCK_SIZE);
      this.ctx.lineTo(this.COLS * this.BLOCK_SIZE, row * this.BLOCK_SIZE);
      this.ctx.stroke();
    }
  }
  
  drawPiece(ctx, piece) {
    if (!piece) return;
    
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          this.drawBlock(ctx, piece.pos.x + x, piece.pos.y + y, piece.color);
        }
      });
    });
  }
  
  drawNextPiece() {
    if (!this.nextPiece) return;
    
    const blockSize = 20; // Smaller blocks for preview
    const centerX = this.nextCanvas.width / 2 - (this.nextPiece.shape[0].length * blockSize) / 2;
    const centerY = this.nextCanvas.height / 2 - (this.nextPiece.shape.length * blockSize) / 2;
    
    this.nextPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          this.nextCtx.fillStyle = COLORS[this.nextPiece.color];
          this.nextCtx.fillRect(centerX + x * blockSize, centerY + y * blockSize, blockSize, blockSize);
          this.nextCtx.strokeStyle = '#fff';
          this.nextCtx.lineWidth = 1;
          this.nextCtx.strokeRect(centerX + x * blockSize, centerY + y * blockSize, blockSize, blockSize);
        }
      });
    });
  }
  
  drawBlock(ctx, x, y, colorIndex) {
    const color = COLORS[colorIndex];
    
    // Main block
    ctx.fillStyle = color;
    ctx.fillRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
    
    // Highlight (top and left edges)
    ctx.fillStyle = this.lightenColor(color, 40);
    ctx.beginPath();
    ctx.moveTo(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE);
    ctx.lineTo((x + 1) * this.BLOCK_SIZE, y * this.BLOCK_SIZE);
    ctx.lineTo(x * this.BLOCK_SIZE, (y + 1) * this.BLOCK_SIZE);
    ctx.fill();
    
    // Shadow (bottom and right edges)
    ctx.fillStyle = this.darkenColor(color, 40);
    ctx.beginPath();
    ctx.moveTo((x + 1) * this.BLOCK_SIZE, y * this.BLOCK_SIZE);
    ctx.lineTo((x + 1) * this.BLOCK_SIZE, (y + 1) * this.BLOCK_SIZE);
    ctx.lineTo(x * this.BLOCK_SIZE, (y + 1) * this.BLOCK_SIZE);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
  }
  
  lightenColor(color, amount) {
    const hex = color.replace('#', '');
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);
    
    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  darkenColor(color, amount) {
    const hex = color.replace('#', '');
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);
    
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  createPiece() {
    const pieces = 'IJLOSTZ';
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    
    return {
      pos: { x: Math.floor(this.COLS / 2) - 1, y: 0 },
      shape: TETROMINOES[type],
      color: pieces.indexOf(type) + 1
    };
  }
  
  moveLeft() {
    this.currentPiece.pos.x--;
    if (this.checkCollision()) {
      this.currentPiece.pos.x++;
    }
  }
  
  moveRight() {
    this.currentPiece.pos.x++;
    if (this.checkCollision()) {
      this.currentPiece.pos.x--;
    }
  }
  
  moveDown() {
    this.currentPiece.pos.y++;
    
    if (this.checkCollision()) {
      this.currentPiece.pos.y--;
      this.lockPiece();
      this.clearLines();
      this.spawnNewPiece();
    }
    
    this.dropCounter = 0;
  }
  
  hardDrop() {
    while (!this.checkCollision()) {
      this.currentPiece.pos.y++;
    }
    
    this.currentPiece.pos.y--;
    this.lockPiece();
    this.clearLines();
    this.spawnNewPiece();
    this.dropCounter = 0;
  }
  
  rotate() {
    const originalShape = this.currentPiece.shape;
    
    // Transpose matrix
    this.currentPiece.shape = this.currentPiece.shape[0].map((_, i) => 
      this.currentPiece.shape.map(row => row[i])
    );
    
    // Reverse each row
    this.currentPiece.shape = this.currentPiece.shape.map(row => [...row].reverse());
    
    // If collision occurs, revert rotation
    if (this.checkCollision()) {
      this.currentPiece.shape = originalShape;
    }
  }
  
  checkCollision() {
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x] !== 0) {
          const boardX = this.currentPiece.pos.x + x;
          const boardY = this.currentPiece.pos.y + y;
          
          // Check boundaries
          if (
            boardX < 0 || 
            boardX >= this.COLS || 
            boardY >= this.ROWS ||
            (boardY >= 0 && this.board[boardY][boardX])
          ) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
  
  lockPiece() {
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x] !== 0) {
          const boardY = this.currentPiece.pos.y + y;
          const boardX = this.currentPiece.pos.x + x;
          
          // If piece is locked above the board, game over
          if (boardY < 0) {
            this.gameOver = true;
            cancelAnimationFrame(this.animationId);
            return;
          }
          
          if (boardY >= 0) {
            this.board[boardY][boardX] = this.currentPiece.color;
          }
        }
      }
    }
    
    // Add points for placing a piece
    this.updateScore(10);
  }
  
  clearLines() {
    let linesCleared = 0;
    
    for (let row = this.ROWS - 1; row >= 0; row--) {
      if (this.board[row].every(cell => cell !== 0)) {
        // Remove the line
        this.board.splice(row, 1);
        // Add empty line at the top
        this.board.unshift(Array(this.COLS).fill(0));
        linesCleared++;
        row++; // Check the same row again
      }
    }
    
    if (linesCleared > 0) {
      // Update lines and score
      this.lines += linesCleared;
      document.getElementById('lines').textContent = this.lines;
      
      // Calculate score based on number of lines cleared
      const points = [0, 100, 300, 500, 800]; // Points for 0, 1, 2, 3, 4 lines
      this.updateScore(points[linesCleared] * this.level);
      
      // Update level
      const newLevel = Math.floor(this.lines / 10) + 1;
      if (newLevel > this.level) {
        this.level = newLevel;
        document.getElementById('level').textContent = this.level;
        this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100); // Speed up as level increases
      }
    }
  }
  
  updateScore(points) {
    this.score += points;
    document.getElementById('score').textContent = this.score;
  }
  
  spawnNewPiece() {
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.createPiece();
    
    // Check if game over
    if (this.checkCollision()) {
      this.gameOver = true;
      cancelAnimationFrame(this.animationId);
      alert(`Game Over! Your score: ${this.score}`);
    }
  }
}
