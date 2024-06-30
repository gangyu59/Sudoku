document.addEventListener('DOMContentLoaded', () => {
    const sudokuContainer = document.getElementById('sudoku-container');
    const startButton = document.getElementById('start-button');
    const difficultySlider = document.getElementById('difficulty-slider');
    const difficultyLabel = document.getElementById('difficulty-label');
    const messageDiv = document.getElementById('message');

    let originalBoard = [];

    const difficulties = ['超易', '易', '中等', '难', '超难'];

    difficultySlider.addEventListener('input', (event) => {
        difficultyLabel.textContent = difficulties[event.target.value - 1];
    });

    startButton.addEventListener('click', () => {
        const level = parseInt(difficultySlider.value);
        messageDiv.textContent = '';
        const board = generateSudoku(level);
        originalBoard = JSON.parse(JSON.stringify(board));
        displaySudoku(board);
    });

    function displaySudoku(board) {
        sudokuContainer.innerHTML = '';
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = '1';
                if (board[r][c] !== 0) {
                    input.value = board[r][c];
                    input.disabled = true;
                } else {
                    input.addEventListener('input', (event) => handleInput(event, r, c));
                }
                cell.appendChild(input);
                sudokuContainer.appendChild(cell);
            }
        }
    }

    function handleInput(event, row, col) {
        const input = event.target;
        const value = input.value;
        if (!/^[1-9]$/.test(value)) {
            input.value = '';
            input.style.backgroundColor = '';
            return;
        }

        input.style.backgroundColor = '';
        if (isValidMove(originalBoard, row, col, parseInt(value))) {
            originalBoard[row][col] = parseInt(value);
            if (isSolved(originalBoard)) {
                messageDiv.textContent = '恭喜成功！';
            }
        } else {
            input.style.backgroundColor = 'red';
            setTimeout(() => {
                input.style.backgroundColor = '';
                input.value = '';
            }, 1000);
        }
    }

    function isValidMove(board, row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num || board[x][col] === num) {
                return false;
            }
        }
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (board[r][c] === num) {
                    return false;
                }
            }
        }
        return true;
    }

    function isSolved(board) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    function generateSudoku(level) {
        const base = 3;
        const side = base * base;

        function pattern(r, c) {
            return (base * (r % base) + Math.floor(r / base) + c) % side;
        }

        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        const rBase = [...Array(base).keys()];
        const rows = shuffle(rBase.flatMap(g => shuffle(rBase).map(r => g * base + r)));
        const cols = shuffle(rBase.flatMap(g => shuffle(rBase).map(c => g * base + c)));
        const nums = shuffle([...Array(side).keys()].map(n => n + 1));

        const board = rows.map(row => cols.map(col => nums[pattern(row, col)]));

        const minEmpty = level * 10;
        const maxEmpty = level * 15;

        let squares = side * side;
        let empties = minEmpty + Math.floor((maxEmpty - minEmpty) * Math.random());

        for (let p = 0; p < empties; p++) {
            let row, col;
            do {
                row = Math.floor(Math.random() * side);
                col = Math.floor(Math.random() * side);
            } while (board[row][col] === 0);
            board[row][col] = 0;
        }

        if (!isValidSudoku(board)) {
            return generateSudoku(level);
        }

        return board;
    }

    function isValidSudoku(board) {
        const rows = new Set();
        const cols = new Set();
        const boxes = new Set();

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] === 0) continue;

                const val = board[r][c];
                const boxIndex = Math.floor(r / 3) * 3 + Math.floor(c / 3);

                if (rows.has(`${r}-${val}`) || cols.has(`${c}-${val}`) || boxes.has(`${boxIndex}-${val}`)) {
                    return false;
                }

                rows.add(`${r}-${val}`);
                cols.add(`${c}-${val}`);
                boxes.add(`${boxIndex}-${val}`);
            }
        }

        return true;
    }
});