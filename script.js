  document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.querySelector('.game-container');
    const game = document.querySelector('.game');
    const gameResult = document.querySelector('.game-result');
    const flagCounter = document.getElementById('num-flags');
    const remainingFlagsCounter = document.getElementById('remaining-flags');
    const generateButton = document.querySelector('.btn-generate');

    generateButton.addEventListener('click', createGame);

    let width = 10;
    let numBombs = 20;
    let numFlags = 0;
    let cells = [];
    let gameOver = false;

    function addNumbers() {
      for (let i = 0; i < cells.length; i++) {
        let total = 0;
        const isLeftEdge = (i % width === 0);
        const isRightEdge = (i % width === width - 1);

        if (cells[i].classList.contains('empty')) {
          if (i > 0 && !isLeftEdge && cells[i - 1].classList.contains('bomb')) total++;
          if (i < (width * width - 1) && !isRightEdge && cells[i + 1].classList.contains('bomb')) total++;
          if (i > width && cells[i - width].classList.contains('bomb')) total++;
          if (i > (width - 1) && !isRightEdge && cells[i + 1 - width].classList.contains('bomb')) total++;
          if (i > width && !isLeftEdge && cells[i - 1 - width].classList.contains('bomb')) total++;
          if (i < (width * (width - 1)) && cells[i + width].classList.contains('bomb')) total++;
          if (i < (width * (width - 1)) && !isRightEdge && cells[i + 1 + width].classList.contains('bomb')) total++;
          if (i < (width * (width - 1)) && !isLeftEdge && cells[i - 1 + width].classList.contains('bomb')) total++;

          cells[i].setAttribute('data', total);
        }
      }
    }

    function revealCells(cell) {
      const cellId = parseInt(cell.id);
      const isLeftEdge = (cellId % width === 0);
      const isRightEdge = (cellId % width === width - 1);

      setTimeout(() => {
        if (cellId > 0 && !isLeftEdge) click(cells[cellId - 1]);
        if (cellId < (width * width - 2) && !isRightEdge) click(cells[cellId + 1]);
        if (cellId >= width) click(cells[cellId - width]);
        if (cellId > (width - 1) && !isRightEdge) click(cells[cellId + 1 - width]);
        if (cellId > (width + 1) && !isLeftEdge) click(cells[cellId - 1 - width]);
        if (cellId < (width * (width - 1))) click(cells[cellId + width]);
        if (cellId < (width * width - width - 2) && !isRightEdge) click(cells[cellId + 1 + width]);
        if (cellId < (width * width - width) && !isLeftEdge) click(cells[cellId - 1 + width]);
      }, 10);
    }

    function bomb(cellClicked) {
      gameOver = true;
      cellClicked.classList.add('back-red');

      cells.forEach((cell, index, array) => {
        if (cell.classList.contains('bomb')) {
          cell.innerHTML = '💣';
          cell.classList.remove('bomb');
          cell.classList.add('flagged');
        }
      });

      gameResult.textContent = 'Sorry, you lost!!!';
      gameResult.classList.add('back-red');
    }

    function addFlag(cell) {
      if (gameOver) return;

      if (!cell.classList.contains('flagged') && numFlags < numBombs) {
        if (!cell.classList.contains('flag')) {
          cell.classList.add('flag');
          cell.innerHTML = '🚩';
          numFlags++;
          updateFlagCounters();
          checkGame();
        } else {
          cell.classList.remove('flag');
          cell.innerHTML = '';
          numFlags--;
        }
      }
    }

    function checkGame() {
      let correctFlags = 0;

      for (let i = 0; i < cells.length; i++) {
        if (cells[i].classList.contains('flag') && cells[i].classList.contains('bomb')) {
          correctFlags++;
        }
      }

      if (correctFlags === numBombs) {
        gameOver = true;
        gameResult.textContent = 'Congratulations, you won!!!';
        gameResult.classList.add('back-green');
      }
    }

    function updateFlagCounters() {
      flagCounter.textContent = numFlags;
      remainingFlagsCounter.textContent = (numBombs - numFlags);
    }

    function click(cell) {
      if (cell.classList.contains('flagged') || cell.classList.contains('flag') || gameOver) return;

      if (cell.classList.contains('bomb')) {
        bomb(cell);
      } else {
        let total = cell.getAttribute('data');
        if (total != 0) {
          cell.classList.add('flagged');
          cell.innerHTML = total;
          return;
        }
        cell.classList.add('flagged');
        revealCells(cell);
      }
    }

    function doubleClick(cell) {
      if (!cell.classList.contains('flagged') || gameOver) return;

      revealCells(cell);
    }

    function createGame() {
      width = parseInt(document.getElementById('size').value);
      numBombs = parseInt(document.getElementById('num-bombs').value);

      if (width < 6 || width > 20) {
        alert(`Size must be between 6 and 20`);
        return;
      }

      if (numBombs < 1) {
        alert(`Number of bombs must be at least 1`);
        return;
      }

      if (numBombs > width * width) {
        alert(`Number of bombs cannot exceed the product of Size x Size (${width * width})`);
        return;
      }

      if (gameContainer.classList.contains('hidden')) {
        gameContainer.classList.remove('hidden');
      } else {
        game.innerHTML = '';
        gameResult.innerHTML = '';
        gameResult.className = 'game-result';
        cells = [];
        gameOver = false;
        numFlags = 0;
      }

      game.style.width = (width * 4) + 'rem';
      gameResult.style.width = (width * 4) + 'rem';

      const bombArray = Array(numBombs).fill('bomb');
      const emptyArray = Array(width * width - numBombs).fill('empty');
      const fullArray = emptyArray.concat(bombArray);
      fullArray.sort(() => Math.random() - 0.5);

      for (let i = 0; i < width * width; i++) {
        const cell = document.createElement('div');
        cell.setAttribute('id', i);
        cell.classList.add(fullArray[i]);
        game.appendChild(cell);
        cells.push(cell);

        cell.addEventListener('click', () => {
          click(event.target);
        });

        cell.oncontextmenu = function (event) {
          event.preventDefault();
          addFlag(cell);
        };

        cell.addEventListener('dblclick', () => {
          doubleClick(event.target);
        });
      }

      addNumbers();
      updateFlagCounters();
    }
  });
