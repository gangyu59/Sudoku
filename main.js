document.addEventListener('DOMContentLoaded', () => {
    const sudokuContainer = document.getElementById('sudoku-container');
    const startButton     = document.getElementById('start-button');
    const difficultySlider = document.getElementById('difficulty-slider');
    const difficultyBadge  = document.getElementById('difficulty-badge');
    const messageDiv       = document.getElementById('message');
    const errorCountEl     = document.getElementById('error-counter');
    const timerEl          = document.getElementById('timer');

    let originalBoard = [];
    let errorCount    = 0;
    let timerInterval = null;
    let timerSeconds  = 0;

    const difficulties = ['超易', '容易', '中等', '较难', '超难'];

    // Sync badge text and color class on slider change
    difficultySlider.addEventListener('input', (event) => {
        const idx = parseInt(event.target.value) - 1;
        updateDifficultyBadge(idx);
    });

    function updateDifficultyBadge(idx) {
        difficultyBadge.textContent = difficulties[idx];
        difficultyBadge.className = `difficulty-badge diff-${idx + 1}`;
    }

    // Initialise badge to match default slider value (1 = 超易)
    updateDifficultyBadge(parseInt(difficultySlider.value) - 1);

    // ── Timer helpers ──────────────────────────────────────────────────
    function startTimer() {
        stopTimer();
        timerSeconds = 0;
        renderTimer();
        timerInterval = setInterval(() => { timerSeconds++; renderTimer(); }, 1000);
    }

    function stopTimer() {
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    }

    function renderTimer() {
        const m = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
        const s = (timerSeconds % 60).toString().padStart(2, '0');
        timerEl.textContent = `${m}:${s}`;
    }

    // ── Start game ─────────────────────────────────────────────────────
    startButton.addEventListener('click', () => {
        const level = parseInt(difficultySlider.value);

        errorCount = 0;
        errorCountEl.textContent = '0';

        messageDiv.textContent = '加载中…';
        messageDiv.className = 'msg-loading';

        setTimeout(() => {
            const board = generateSudoku(level);
            originalBoard = JSON.parse(JSON.stringify(board));
            displaySudoku(board);
            messageDiv.textContent = '';
            messageDiv.className = '';
            startTimer();
        }, 80);
    });

    // ── Render grid ────────────────────────────────────────────────────
    function displaySudoku(board) {
        sudokuContainer.innerHTML = '';

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');

                // Alternating 3×3 box shading (checkerboard)
                if ((Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 1) {
                    cell.classList.add('box-shade');
                }

                // Thick borders to mark 3×3 box boundaries
                if (c === 2 || c === 5) cell.classList.add('thick-right');
                if (r === 2 || r === 5) cell.classList.add('thick-bottom');

                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = '1';
                input.inputMode = 'numeric';

                if (board[r][c] !== 0) {
                    input.value = board[r][c];
                    input.disabled = true;
                } else {
                    input.addEventListener('input', (e) => handleInput(e, r, c));
                }

                cell.appendChild(input);
                sudokuContainer.appendChild(cell);
            }
        }
    }

    // ── Input validation ───────────────────────────────────────────────
    function handleInput(event, row, col) {
        const input = event.target;
        const cell  = input.parentElement;

        // Ignore input while error animation is running
        if (cell.classList.contains('error')) {
            input.value = '';
            return;
        }

        // Extract only the last valid digit (handles IME/mobile composition)
        const digit = input.value.replace(/[^1-9]/g, '').slice(-1);
        if (!digit) {
            input.value = '';
            return;
        }
        input.value = digit;

        if (isValidMove(originalBoard, row, col, parseInt(digit))) {
            originalBoard[row][col] = parseInt(digit);
            input.disabled = true;

            // Brief green flash
            cell.classList.add('correct-flash');
            setTimeout(() => cell.classList.remove('correct-flash'), 500);

            if (isSolved(originalBoard)) {
                stopTimer();
                messageDiv.textContent = '恭喜成功！';
                messageDiv.className = 'msg-win';
            }
        } else {
            input.value = ''; // Clear immediately so next input works
            cell.classList.add('error');
            errorCount++;
            errorCountEl.textContent = errorCount;

            setTimeout(() => {
                cell.classList.remove('error');
            }, 900);
        }
    }

    // ── Sudoku logic ───────────────────────────────────────────────────
    function isValidMove(board, row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num || board[x][col] === num) return false;
        }
        const sr = Math.floor(row / 3) * 3;
        const sc = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (board[sr + r][sc + c] === num) return false;
            }
        }
        return true;
    }

    function isSolved(board) {
        for (let r = 0; r < 9; r++)
            for (let c = 0; c < 9; c++)
                if (board[r][c] === 0) return false;
        return true;
    }

    function generateSudoku(level) {
        const side    = 9;
        const timeout = 10000;
        const start   = Date.now();

        function shuffle(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        const board = Array.from({ length: side }, () => Array(side).fill(0));
        const nums  = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        function fillCell(row, col) {
            if (row === side) return true;
            const nextRow = col === side - 1 ? row + 1 : row;
            const nextCol = col === side - 1 ? 0 : col + 1;
            for (const num of shuffle(nums.slice())) {
                if (isValidMove(board, row, col, num)) {
                    board[row][col] = num;
                    if (fillCell(nextRow, nextCol)) return true;
                    board[row][col] = 0;
                }
            }
            return false;
        }

        fillCell(0, 0);

        const minEmpty = level * 10;
        const maxEmpty = level * 15;
        const empties  = minEmpty + Math.floor(Math.random() * (maxEmpty - minEmpty + 1));

        for (let p = 0; p < empties; p++) {
            let row, col;
            do {
                row = Math.floor(Math.random() * side);
                col = Math.floor(Math.random() * side);
            } while (board[row][col] === 0);
            board[row][col] = 0;

            if (Date.now() - start > timeout) {
                alert('生成数独超时，请重试！');
                return [];
            }
        }

        return board;
    }
});
