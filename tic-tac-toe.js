//#region CONSTRUCTORS

const SIDES = {
    CIRCLE: "circle",
    MARK: "mark",
};
Object.freeze(SIDES);

const Player = (name, side) => {
    let status = false;

    const getSide = () => side;
    const getName = () => name;
    const getStatus = () => status;
    const win = () => status = true;

    return { getSide, getName, getStatus, win };
}

const BoardSquare = (tileId) => {
    let playerControl = "none";

    const getControl = () => playerControl;
    const setControl = (player) => {
        if (playerControl == "none") {
            playerControl = player.getSide();
            toggleActive();
            return true;
        }
        return false;
    }
    const getTileId = () => tileId;

    return { getControl, setControl, getTileId }
}

const Gameboard = (playerOne, playerTwo) => {
    /** @type {BoardSquare[]} */
    let boardSquares = [];
    let playerOneTurn = true;

    const getFirstPlayer = () => playerOne;
    const getSecondPlayer = () => playerTwo;

    const initializeGame = () => {
        boardSquares = [];
        for (let i = 0; i < 9; i++) {
            boardSquares.push(BoardSquare(i));          
        }
    }
    const markSquare = (tileId) => {
        let square = boardSquares[tileId];
        if (playerOneTurn) {
            if (square.setControl(getFirstPlayer())) {
                playerOneTurn = false;
            }
        }
        else if (!playerOneTurn) {
            if (square.setControl(getSecondPlayer())) {
                playerOneTurn = true;
            }
        }
    }
    const checkCondition = (player) => {
        if ((boardSquares[0].getControl() == player.getSide() &&
            boardSquares[1].getControl() == player.getSide() &&
            boardSquares[2].getControl() == player.getSide()) ||
            (boardSquares[2].getControl() == player.getSide() &&
            boardSquares[5].getControl() == player.getSide() &&
            boardSquares[8].getControl() == player.getSide()) ||
            (boardSquares[6].getControl() == player.getSide() &&
            boardSquares[7].getControl() == player.getSide() &&
            boardSquares[8].getControl() == player.getSide()) ||
            (boardSquares[0].getControl() == player.getSide() &&
            boardSquares[3].getControl() == player.getSide() &&
            boardSquares[6].getControl() == player.getSide()) ||
            (boardSquares[0].getControl() == player.getSide() &&
            boardSquares[4].getControl() == player.getSide() &&
            boardSquares[8].getControl() == player.getSide()) ||
            (boardSquares[2].getControl() == player.getSide() &&
            boardSquares[4].getControl() == player.getSide() &&
            boardSquares[6].getControl() == player.getSide()) ||
            (boardSquares[3].getControl() == player.getSide() &&
            boardSquares[4].getControl() == player.getSide() &&
            boardSquares[5].getControl() == player.getSide()) ||
            (boardSquares[1].getControl() == player.getSide() &&
            boardSquares[4].getControl() == player.getSide() &&
            boardSquares[7].getControl() == player.getSide()))
            {
                /*
                0 1 2
                3 4 5
                6 7 8
                */
                player.win();
            }
    }
    const checkDraw = () => {
        let draw = true;

        for (const square of boardSquares) {
            if (square.getControl() == "none") {
                draw = false;
            }
        }

        return draw;
    }

    const getSquares = () => [...boardSquares];

    return { getFirstPlayer, getSecondPlayer, initializeGame, markSquare, checkCondition, checkDraw, getSquares }
}

var AIGame = false;

//#endregion CONSTRUCTORS

//#region UI

function render(gameboard, playerOne, playerTwo) {
    let gameBoardDiv = document.getElementById("gameboard");
    let newGameboardDiv = document.createElement("div");
    
    for (const square of gameboard.getSquares()) {
        let squareElement = generateBoardSquareElement(gameboard, square);
        newGameboardDiv.append(squareElement);
    }

    newGameboardDiv.id = "gameboard";
    gameBoardDiv.replaceWith(newGameboardDiv);

    gameboard.checkCondition(playerTwo);
    gameboard.checkCondition(playerOne);

    if (playerOne.getStatus()) {
        let message = AIGame ? "You win this game!" : `${playerOne.getName()} wins this game!`;
        resetGame(message);
    }
    else if (playerTwo.getStatus()) {
        let message = `${playerTwo.getName()} wins this game!`;
        resetGame(message);
    }
    else if (gameboard.checkDraw()) {
        resetGame("It's a draw!");
    }
}

/** @param {Gameboard} gameboard */
function makeAIMove(gameboard) {
    let searching = true;

    while (searching) {
        let randomSpot = Math.floor(Math.random() * 9);
        if (gameboard.getSquares()[randomSpot].getControl() == "none") {
            gameboard.markSquare(randomSpot);
            searching = false;
        }
    }
}

/** @param {BoardSquare} boardSquareObject */
function generateBoardSquareElement(gameboard, boardSquareObject) {
    let button = document.createElement("button");
    let idAttribute = document.createAttribute("data-id");
    let img = document.createElement("i");

    button.classList.add("grid-button");
    idAttribute.value = boardSquareObject.getTileId();

    if (boardSquareObject.getControl() == "none") {
        img.classList.add("far");
        img.classList.add("fa-square");
    }
    else if (boardSquareObject.getControl() == SIDES.CIRCLE) {
        img.classList.add("far");
        img.classList.add("fa-circle");
    }
    else {
        img.classList.add("fas");
        img.classList.add("fa-times");
    }

    button.append(img);
    button.setAttributeNode(idAttribute);

    button.addEventListener("click", () => {
        gameboard.markSquare(boardSquareObject.getTileId());
        if (AIGame && !gameboard.checkDraw()) {
            makeAIMove(gameboard);
        }
        render(gameboard, gameboard.getFirstPlayer(), gameboard.getSecondPlayer());
    });

    return button;
}

function toggleActive() {
    let firstCheck = document.getElementById("first-active");
    let secondCheck = document.getElementById("second-active");

    if (firstCheck.style.display == "none") {
        firstCheck.style.display = "inline";
        secondCheck.style.display = "none";
    }
    else {
        firstCheck.style.display = "none";
        secondCheck.style.display = "inline";
    }
}

function setScoreboardNames(first, second) {
    document.getElementById("first-name").textContent = first.getName();
    document.getElementById("second-name").textContent = second.getName();
}

function resetGame(messageToDisplay) {
    let victoryScreen = document.getElementById("victory-screen");
    let textDisplay = document.getElementById("text-display");

    textDisplay.textContent = messageToDisplay;
    textDisplay.style.display = "block";
    victoryScreen.style.height = "100vh";
}

function goToPickPlayerNames() {
    let playersButton = document.getElementById("choose-players");
    let aiButton = document.getElementById("choose-ai");
    let setupPlayers = document.getElementById("setup-players");

    playersButton.style.display = "none";
    aiButton.style.display = "none";
    setupPlayers.style.display = "flex";
}

function goToMenu() {
    let setupMenu = document.getElementById("setup-menu");
    let victoryScreen = document.getElementById("victory-screen");
    let textDisplay = document.getElementById("text-display");
    let playersButton = document.getElementById("choose-players");
    let aiButton = document.getElementById("choose-ai");

    playersButton.style.display = "block";
    aiButton.style.display = "block";
    textDisplay.textContent = "";
    textDisplay.style.display = "none";
    victoryScreen.style.height = "0vh";
    setupMenu.style.display = "flex";
}

//#endregion UI

function playHumanGame() {
    AIGame = false;
    let firstInput = document.getElementById("player-one-name");
    let secondInput = document.getElementById("player-two-name");
    let setupForm = document.getElementById("setup-players");
    let setupMenu = document.getElementById("setup-menu");

    const playerOne = Player(firstInput.value, SIDES.CIRCLE);
    const playerTwo = Player(secondInput.value, SIDES.MARK);

    setScoreboardNames(playerOne, playerTwo);

    firstInput.value = "";
    secondInput.value = "";
    setupForm.style.display = "none";
    setupMenu.style.display = "none";

    const gameboard = Gameboard(playerOne, playerTwo);
    gameboard.initializeGame();

    render(gameboard, playerOne, playerTwo);
}

function playAIGame() {
    let setupMenu = document.getElementById("setup-menu");
    AIGame = true;
    const player = Player("You", SIDES.CIRCLE);
    const AI = Player("Bot Waldo", SIDES.MARK);

    setScoreboardNames(player, AI);

    setupMenu.style.display = "none";

    const gameboard = Gameboard(player, AI);
    gameboard.initializeGame();

    render(gameboard, player, AI);
}