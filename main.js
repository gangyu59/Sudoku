document.addEventListener('DOMContentLoaded', () => {
    const sudokuContainer = document.getElementById('sudoku-container');
    const startButton = document.getElementById('start-button');
    const difficultySlider = document.getElementById('difficulty-slider');
    const difficultyLabel = document.getElementById('difficulty-label');
    const messageDiv = document.getElementById('message');
    const errorCounter = document.getElementById('error-counter');

    let originalBoard = [];
    let errorCount = 0;

    const difficulties = ['超易', '容易', '中等', '较难', '超难'];

    difficultySlider.addEventListener('input', (event) => {
        difficultyLabel.textContent = difficulties[event.target.value - 1];
    });

    startButton.addEventListener('click', () => {
        const level = parseInt(difficultySlider.value);
        messageDiv.textContent = '加载中...';
        setTimeout(() => {
            const board = generateSudoku(level);
            originalBoard = JSON.parse(JSON.stringify(board));
            displaySudoku(board);
            messageDiv.textContent = '';
        }, 100); // 加入短暂延时以显示“加载中...”文本
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
            errorCount++;
            errorCounter.textContent = `错误次数 = ${errorCount}`;
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
        const timeout = 10000; // 10 seconds timeout
        const startTime = new Date().getTime();

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

        function fillBoard(board) {
            for (let i = 0; i < side; i++) {
                for (let j = 0; j < side; j++) {
                    board[i][j] = 0;
                }
            }
            for (let i = 0; i < side; i++) {
                let num = 1;
                for (let j = 0; j < side; j++) {
                    while (!isValidMove(board, i, j, num)) {
                        num++;
                        if (num > side) num = 1;
                    }
                    board[i][j] = num;
                }
            }
            return board;
        }

        const board = Array.from({ length: side }, () => Array(side).fill(0));
        fillBoard(board);

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

            if (new Date().getTime() - startTime > timeout) {
                alert('生成数独超时，请重试！');
                return [];
            }
        }

        return board;
    }
});