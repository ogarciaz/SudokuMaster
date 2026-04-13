document.querySelector('#dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDarkMode = document.body.classList.contains('dark');
    localStorage.setItem('darkmode', isDarkMode);
    document.querySelector('meta[name="theme-color"').setAttribute('content', isDarkMode ? '#1a1a2e' : '#fff');
});

const start_screen = document.querySelector('#start-screen');
const game_screen = document.querySelector('#game-screen');
const pause_screen = document.querySelector('#pause-screen');
const result_screen = document.querySelector('#result-screen');

const cells = document.querySelectorAll('.main-grid-cell');
const name_input = document.querySelector('#input-name');
const number_inputs = document.querySelectorAll('.number');
const player_name = document.querySelector('#player-name');
const game_level = document.querySelector('#game-level');
const game_time = document.querySelector('#game-time');
const result_time = document.querySelector('#result-time');
const game_points_span = document.querySelector('#game-points');
const final_points_span = document.querySelector('#final-points');

let level_index = 0;
let level = CONSTANT.LEVEL[level_index];
let timer = null;
let pause = false;
let seconds = 0;
let pontos = 0;
let su = undefined;
let su_answer = undefined;
let selected_cell = -1;

function atualizarPontuacaoDisplay() {
    if (game_points_span) game_points_span.innerText = pontos;
    if (final_points_span) final_points_span.innerText = pontos;
    localStorage.setItem('sudoku_pontos', pontos);
}

function adicionarPontos(valor) {
    pontos += valor;
    if (pontos < 0) pontos = 0;
    atualizarPontuacaoDisplay();
}

const getGameInfo = () => JSON.parse(localStorage.getItem('game'));

const initGameGrid = () => {
    let index = 0;
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE,2); i++) {
        let row = Math.floor(i/CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        if (row === 2 || row === 5) cells[index].style.marginBottom = '10px';
        if (col === 2 || col === 5) cells[index].style.marginRight = '10px';
        index++;
    }
}

const setPlayerName = (name) => localStorage.setItem('player_name', name);
const getPlayerName = () => localStorage.getItem('player_name');

const showTime = (seconds) => {
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const clearSudoku = () => {
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        cells[i].innerHTML = '';
        cells[i].classList.remove('filled');
        cells[i].classList.remove('selected');
    }
}

const initSudoku = () => {
    clearSudoku();
    resetBg();
    su = sudokuGen(level);
    su_answer = [...su.question];
    seconds = 0;
    pontos = 0;
    atualizarPontuacaoDisplay();
    saveGameInfo();
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        cells[i].setAttribute('data-value', su.question[row][col]);
        if (su.question[row][col] !== 0) {
            cells[i].classList.add('filled');
            cells[i].innerHTML = su.question[row][col];
        }
    }
}

const loadSudoku = () => {
    let game = getGameInfo();
    game_level.innerHTML = CONSTANT.LEVEL_NAME[game.level];
    su = game.su;
    su_answer = game.su.answer;
    seconds = game.seconds;
    pontos = game.pontos || 0;
    atualizarPontuacaoDisplay();
    game_time.innerHTML = showTime(seconds);
    level_index = game.level;
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        cells[i].setAttribute('data-value', su_answer[row][col]);
        cells[i].innerHTML = su_answer[row][col] !== 0 ? su_answer[row][col] : '';
        if (su.question[row][col] !== 0) {
            cells[i].classList.add('filled');
        }
    }
}

const hoverBg = (index) => {
    let row = Math.floor(index / CONSTANT.GRID_SIZE);
    let col = index % CONSTANT.GRID_SIZE;
    let box_start_row = row - row % 3;
    let box_start_col = col - col % 3;
    for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
        for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
            let cell = cells[9 * (box_start_row + i) + (box_start_col + j)];
            cell.classList.add('hover');
        }
    }
    let step = 9;
    while (index - step >= 0) {
        cells[index - step].classList.add('hover');
        step += 9;
    }
    step = 9;
    while (index + step < 81) {
        cells[index + step].classList.add('hover');
        step += 9;
    }
    step = 1;
    while (index - step >= 9*row) {
        cells[index - step].classList.add('hover');
        step += 1;
    }
    step = 1;
    while (index + step < 9*row + 9) {
        cells[index + step].classList.add('hover');
        step += 1;
    }
}

const resetBg = () => {
    cells.forEach(e => e.classList.remove('hover'));
}

const checkErr = (value) => {
    const addErr = (cell) => {
        if (parseInt(cell.getAttribute('data-value')) === value) {
            cell.classList.add('err');
            cell.classList.add('cell-err');
            setTimeout(() => {
                cell.classList.remove('cell-err');
            }, 500);
        }
    }
    let index = selected_cell;
    let row = Math.floor(index / CONSTANT.GRID_SIZE);
    let col = index % CONSTANT.GRID_SIZE;
    let box_start_row = row - row % 3;
    let box_start_col = col - col % 3;
    for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
        for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
            let cell = cells[9 * (box_start_row + i) + (box_start_col + j)];
            if (!cell.classList.contains('selected')) addErr(cell);
        }
    }
    let step = 9;
    while (index - step >= 0) {
        addErr(cells[index - step]);
        step += 9;
    }
    step = 9;
    while (index + step < 81) {
        addErr(cells[index + step]);
        step += 9;
    }
    step = 1;
    while (index - step >= 9*row) {
        addErr(cells[index - step]);
        step += 1;
    }
    step = 1;
    while (index + step < 9*row + 9) {
        addErr(cells[index + step]);
        step += 1;
    }
}

const removeErr = () => cells.forEach(e => e.classList.remove('err'));

const saveGameInfo = () => {
    let game = {
        level: level_index,
        seconds: seconds,
        pontos: pontos,
        su: {
            original: su.original,
            question: su.question,
            answer: su_answer
        }
    }
    localStorage.setItem('game', JSON.stringify(game));
}

const removeGameInfo = () => {
    localStorage.removeItem('game');
    const continueBtn = document.querySelector('#btn-continue');
    if (continueBtn) continueBtn.style.display = 'none';
}

const isGameWin = () => sudokuCheck(su_answer);

const showResult = () => {
    clearInterval(timer);
    if (final_points_span) final_points_span.innerText = pontos;
    result_screen.classList.add('active');
    result_time.innerHTML = showTime(seconds);
}

const initNumberInputEvent = () => {
    number_inputs.forEach((e, index) => {
        e.addEventListener('click', () => {
            if (selected_cell !== -1 && !cells[selected_cell].classList.contains('filled')) {
                cells[selected_cell].innerHTML = index + 1;
                cells[selected_cell].setAttribute('data-value', index + 1);
                let row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
                let col = selected_cell % CONSTANT.GRID_SIZE;
                su_answer[row][col] = index + 1;
                
                adicionarPontos(10);
                saveGameInfo();
                removeErr();
                checkErr(index + 1);
                cells[selected_cell].classList.add('zoom-in');
                setTimeout(() => {
                    cells[selected_cell].classList.remove('zoom-in');
                }, 500);
                if (isGameWin()) {
                    adicionarPontos(500);
                    removeGameInfo();
                    showResult();
                }
            }
        })
    })
}

const initCellsEvent = () => {
    cells.forEach((e, index) => {
        e.addEventListener('click', () => {
            if (!e.classList.contains('filled')) {
                cells.forEach(cell => cell.classList.remove('selected'));
                selected_cell = index;
                e.classList.remove('err');
                e.classList.add('selected');
                resetBg();
                hoverBg(index);
            }
        })
    })
}

const startGame = () => {
    start_screen.classList.remove('active');
    game_screen.classList.add('active');
    player_name.innerHTML = name_input.value.trim();
    setPlayerName(name_input.value.trim());
    game_level.innerHTML = CONSTANT.LEVEL_NAME[level_index];
    game_time.innerHTML = showTime(seconds);
    timer = setInterval(() => {
        if (!pause) {
            seconds++;
            game_time.innerHTML = showTime(seconds);
        }
    }, 1000);
}

const returnStartScreen = () => {
    clearInterval(timer);
    pause = false;
    seconds = 0;
    start_screen.classList.add('active');
    game_screen.classList.remove('active');
    pause_screen.classList.remove('active');
    result_screen.classList.remove('active');
}

document.querySelector('#btn-level').addEventListener('click', (e) => {
    level_index = level_index + 1 > CONSTANT.LEVEL.length - 1 ? 0 : level_index + 1;
    level = CONSTANT.LEVEL[level_index];
    e.target.innerHTML = CONSTANT.LEVEL_NAME[level_index];
});

document.querySelector('#btn-play').addEventListener('click', () => {
    if (name_input.value.trim().length > 0) {
        initSudoku();
        startGame();
    } else {
        name_input.classList.add('input-err');
        setTimeout(() => {
            name_input.classList.remove('input-err');
            name_input.focus();
        }, 500);
    }
});

document.querySelector('#btn-continue').addEventListener('click', () => {
    if (name_input.value.trim().length > 0) {
        loadSudoku();
        startGame();
    } else {
        name_input.classList.add('input-err');
        setTimeout(() => {
            name_input.classList.remove('input-err');
            name_input.focus();
        }, 500);
    }
});

document.querySelector('#btn-pause').addEventListener('click', () => {
    pause_screen.classList.add('active');
    pause = true;
});

document.querySelector('#btn-resume').addEventListener('click', () => {
    pause_screen.classList.remove('active');
    pause = false;
});

document.querySelector('#btn-new-game').addEventListener('click', () => {
    returnStartScreen();
});

document.querySelector('#btn-new-game-2').addEventListener('click', () => {
    returnStartScreen();
});

document.querySelector('#btn-delete').addEventListener('click', () => {
    if (selected_cell !== -1 && !cells[selected_cell].classList.contains('filled')) {
        cells[selected_cell].innerHTML = '';
        cells[selected_cell].setAttribute('data-value', 0);
        let row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
        let col = selected_cell % CONSTANT.GRID_SIZE;
        su_answer[row][col] = 0;
        removeErr();
    }
})

const init = () => {
    const darkmode = JSON.parse(localStorage.getItem('darkmode'));
    if (darkmode) document.body.classList.add('dark');
    document.querySelector('meta[name="theme-color"').setAttribute('content', darkmode ? '#1a1a2e' : '#fff');
    const game = getGameInfo();
    const continueBtn = document.querySelector('#btn-continue');
    if (continueBtn) continueBtn.style.display = game ? 'grid' : 'none';
    initGameGrid();
    initCellsEvent();
    initNumberInputEvent();
    if (getPlayerName()) {
        name_input.value = getPlayerName();
    } else {
        name_input.focus();
    }
}

init();