import './style.css'
import { Tetris } from './js/tetris.js'

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const tetris = new Tetris();
  
  // Start button event listener
  document.getElementById('start-button').addEventListener('click', () => {
    tetris.start();
    document.getElementById('start-button').blur(); // Remove focus to prevent spacebar from triggering button
  });
});
