let numberClick = 0;

let scores = [0, 0];
let board = [5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 0]; // Quan cells start at 0
let quanStones = [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]; // 1 = has Quan stone, 0 = no Quan stone

let newGame = 0;
let FirstMove = 1;
let currentPlayer = FirstMove;
let quanPoints = 10; 
let selectedIndex = -1;
let draggedIndex = -1;