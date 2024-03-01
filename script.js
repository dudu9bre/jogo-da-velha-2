// variavel global

const game = document.querySelector(".board")
const currentPlayer = document.querySelector(".slider")

let selected

// mudar cor de fundo

const themeBtn = document.querySelector(".theme-btn")
let ball = document.querySelector(".ball")
let todosBtn = document.querySelectorAll(".btn")
let playerContainer = document.querySelector(".player-container")

const changeColor = () => {
    if (document.body.style.backgroundColor == "beige") {
        document.body.style.backgroundColor = "rgb(51, 51, 61)"
        themeBtn.classList.add("theme-btn-black-theme")
        ball.classList.add("ball-black-theme")
        todosBtn.forEach(btn => btn.classList.add("btn-black-theme"))
        currentPlayer.classList.add("slider-black-theme")
    } else {
        document.body.style.backgroundColor = "beige"
        themeBtn.classList.remove("theme-btn-black-theme")
        ball.classList.remove("ball-black-theme")
        todosBtn.forEach(btn => btn.classList.remove("btn-black-theme"))
        currentPlayer.classList.remove("slider-black-theme")
    }
}

themeBtn.addEventListener("click", changeColor)
themeBtn.addEventListener("touchstart", changeColor)

// lógica pra escolher o icon

var origBoard
let huPlayer
let huPlayer2
let aiPlayer
const winCombos = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[6, 4, 2]
]

const cells = document.querySelectorAll('.box')
startGame()

function startGame() {
	origBoard = Array.from(Array(9).keys())
	for (var i = 0; i < cells.length; i++) {
		cells[i].innerText = ''
		cells[i].addEventListener('click', turnClick, false)
        cells[i].addEventListener("touchstart", turnClick, false)
	}
}

async function turnClick(square) {
    if (typeof origBoard[square.target.id] == "number") {
        if (gameMode == "two") {
            if (huPlayer == "X") {
                turn(square.target.id, huPlayer)
                let gameWon = checkWin(origBoard, huPlayer)
                if (gameWon) {
                    gameOver(gameWon)
                }
                moveSlider()
                huPlayer = "O"
            } else if (huPlayer == "O") {
                turn(square.target.id, huPlayer)
                let gameWon = checkWin(origBoard, huPlayer)
                if (gameWon) {
                    gameOver(gameWon)
                }
                moveSlider()
                huPlayer = "X"
            }
        } else if (gameMode == "one") {
            if(huPlayer == "X") {
                currentPlayer.classList.remove("left")
                currentPlayer.classList.add("right")
            } else if (huPlayer == "O") {
                currentPlayer.classList.remove("right")
                currentPlayer.classList.add("left")
            }
            if (iaLevel == "dumb") {
                turn(square.target.id, huPlayer)
                let gameWon = checkWin(origBoard, huPlayer)
                if (gameWon) {
                    gameOver(gameWon)
                } else if (!checkTie()) {
                    await new Promise(resolve => setTimeout(resolve, 500))
                    turn(dumbSpot(), aiPlayer)
                    gameWon = checkWin(origBoard, aiPlayer)
                    if (huPlayer == "X") {
                        currentPlayer.classList.remove("right")
                        currentPlayer.classList.add("left")
                    } else if (huPlayer == "O") {
                        currentPlayer.classList.remove("left")
                        currentPlayer.classList.add("right")
                    }
                    if (gameWon) {
                        gameOver(gameWon)
                    }
                }
            } else if (iaLevel == "smart") {
                turn(square.target.id, huPlayer)
                let gameWon = checkWin(origBoard, huPlayer)
                if (gameWon) {
                    gameOver(gameWon)
                } else if (!checkTie()) {
                    await new Promise(resolve => setTimeout(resolve, 500))
                    turn(bestSpot(), aiPlayer)
                    gameWon = checkWin(origBoard, aiPlayer)
                    if (huPlayer == "X") {
                        currentPlayer.classList.remove("right")
                        currentPlayer.classList.add("left")
                    } else if (huPlayer == "O") {
                        currentPlayer.classList.remove("left")
                        currentPlayer.classList.add("right")
                    }
                    if (gameWon) {
                        gameOver(gameWon)
                    }
                }
            }
        }
    }
}

function turn(squareId, player) {
	origBoard[squareId] = player
	document.getElementById(squareId).innerText = player
	let gameWon = checkWin(origBoard, player)
	if (gameWon) gameOver(gameWon)
}

function checkWin(board, player) {
	let plays = board.reduce((a, e, i) =>
		(e === player) ? a.concat(i) : a, [])
	let gameWon = null
	for (let [index, win] of winCombos.entries()) {
		if (win.every(elem => plays.indexOf(elem) > -1)) {
			gameWon = {index: index, player: player}
			break
		}
	}
	return gameWon
}

function gameOver(gameWon) {
	for (let index of winCombos[gameWon.index]) {
		document.getElementById(index).style.backgroundColor =
			gameWon.player == huPlayer ? "blue" : "red"
	}
	for (var i = 0; i < cells.length; i++) {
		cells[i].removeEventListener('click', turnClick, false)
	}
	declareWinner(gameWon.player == huPlayer ? "Você venceu!" : "Você perdeu!")
}

function declareWinner(who) {
	document.querySelector(".endgame").style.display = "block"
	document.querySelector(".endgame .text").innerText = who
}

function emptySquares() {
	return origBoard.filter(s => typeof s == 'number')
}
function dumbSpot() {
    return emptySquares()[0]
}
function bestSpot() {
	return minimax(origBoard, aiPlayer).index
}

function checkTie() {
	if (emptySquares().length == 0) {
		for (let i = 0; i < cells.length; i++) {
			cells[i].style.backgroundColor = "green"
			cells[i].removeEventListener('click', turnClick, false)
		}
		declareWinner("Deu velha!")
		return true
	}
	return false
}

function minimax(newBoard, player) {
	let availSpots = emptySquares()

	if (checkWin(newBoard, huPlayer)) {
		return {score: -10}
	} else if (checkWin(newBoard, aiPlayer)) {
		return {score: 10}
	} else if (availSpots.length === 0) {
		return {score: 0}
	}
	let moves = []
	for (let i = 0; i < availSpots.length; i++) {
		let move = {}
		move.index = newBoard[availSpots[i]]
		newBoard[availSpots[i]] = player

		if (player == aiPlayer) {
			let result = minimax(newBoard, huPlayer)
			move.score = result.score
		} else {
			let result = minimax(newBoard, aiPlayer)
			move.score = result.score
		}

		newBoard[availSpots[i]] = move.index

		moves.push(move)
	}

	let bestMove
	if(player === aiPlayer) {
		let bestScore = -10000
		for(let i = 0; i < moves.length; i++) {
			if (moves[i].score > bestScore) {
				bestScore = moves[i].score
				bestMove = i
			}
		}
	} else {
		let bestScore = 10000;
		for(let i = 0; i < moves.length; i++) {
			if (moves[i].score < bestScore) {
				bestScore = moves[i].score
				bestMove = i
			}
		}
	}
    moveSlider()
	return moves[bestMove]
}

// lógica pra definir o jogo
let secPlayerBtn = document.querySelectorAll(".sec-player")
let iconChoiceBtn = document.querySelectorAll(".icon-choice")
let iaTypeBtn = document.querySelectorAll(".ia-type")
let iaLevel
let gameMode

const defSecPlayer = (e) => {
    let secBtnClicado = e.target

    if (secBtnClicado.classList.contains("vsTwo")) {
        gameMode = "two"
        if (huPlayer == "X") {
            currentPlayer.classList.add("left")
        } else if (huPlayer == "O") {
            currentPlayer.classList.add("right")
        }
        game.classList.remove("hide")
        currentPlayer.classList.remove("hide")
    } else if (secBtnClicado.classList.contains("vsIa")) {
        const defIa = (e) => {
            iaType = e.target
            gameMode = "one"
            if (iaType.classList.contains("dumb-ia")) {
                iaLevel = "dumb"
            } else if (iaType.classList.contains("smart-ia")) {
                iaLevel = "smart"
            }
            iaTypeBtn.forEach(btn => btn.classList.add("hide"))
            game.classList.remove("hide")
        }

        secPlayerBtn.forEach(btn => btn.classList.add("hide"))
        iaTypeBtn.forEach(btn => btn.classList.remove("hide"))
        iaTypeBtn.forEach(btn => {
            btn.addEventListener("click", defIa)
            btn.addEventListener("touchstart", defIa)
        })
    }
    currentPlayer.classList.remove("hide")
    secPlayerBtn.forEach(btn => btn.classList.add("hide"))
}

const defIcon = (e) => {
    let btnClicado = e.target

    if (btnClicado.classList.contains("xIcon")) {
        huPlayer = "X"
        aiPlayer = "O"
        huPlayer2 = "O"
    } else if (btnClicado.classList.contains("oIcon")) {
        huPlayer = "O"
        aiPlayer = "X"
        huPlayer2 = "X"
    }
    iconChoiceBtn.forEach(btn => btn.classList.add("hide"))
    secPlayerBtn.forEach(btn => btn.classList.remove("hide"))
    secPlayerBtn.forEach(btn => {
        btn.addEventListener("click", defSecPlayer)
        btn.addEventListener("touchstart", defSecPlayer)
    })
}

iconChoiceBtn.forEach(btn => {
    btn.addEventListener("click", defIcon)
    btn.addEventListener("touchstart", defIcon)
})

const moveSlider = () => {
    if (huPlayer == "X") {
        currentPlayer.classList.remove("left")
        currentPlayer.classList.add("right")
    } else if (huPlayer == "O") {
        currentPlayer.classList.remove("right")
        currentPlayer.classList.add("left")
    }
}