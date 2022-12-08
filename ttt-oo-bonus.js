const readline = require('readline-sync');

class Square {
  static UNUSED_SQUARE = ' ';
  static HUMAN_MARKER = 'X';
  static COMPUTER_MARKER = 'O';
  static MIDDLE_SQUARE = 5;

  constructor(marker = Square.UNUSED_SQUARE) {
    this.marker = marker;
  }

  toString() {
    return this.marker;
  }

  getMarker() {
    return this.marker;
  }

  setMarker(marker) {
    this.marker = marker;
  }

  isAvailable() {
    return this.marker === Square.UNUSED_SQUARE;
  }
}

class Board {
  constructor() {
    this.reset();
  }

  reset() {
    this.squares = {};

    for (let count = 1; count <= 9; count++) {
      this.squares[String(count)] = new Square();
    }
  }

  display() {
    console.log("");
    console.log("     |     |");
    console.log(`  ${this.squares["1"]}  |  ${this.squares["2"]}  |  ${this.squares["3"]}`);
    console.log("     |     |");
    console.log("-----+-----+-----");
    console.log("     |     |");
    console.log(`  ${this.squares["4"]}  |  ${this.squares["5"]}  |  ${this.squares["6"]}`);
    console.log("     |     |");
    console.log("-----+-----+-----");
    console.log("     |     |");
    console.log(`  ${this.squares["7"]}  |  ${this.squares["8"]}  |  ${this.squares["9"]}`);
    console.log("     |     |");
    console.log("");
  }

  displayWithClear() {
    console.clear();
    this.display();
  }

  markSquareAt(sqNum, marker) {
    this.squares[String(sqNum)].setMarker(marker);
  }

  unusedSquares() {
    const keys = Object.keys(this.squares);
    return keys.filter(key => this.isUnusedSquare(key));
  }

  isUnusedSquare(sq) {
    return this.squares[sq].isAvailable();
  }

  isFull() {
    return this.unusedSquares().length === 0;
  }

  countMarkersFor(player, keys) {
    const markers = keys.filter(key => {
      return this.squares[key].getMarker() === player.getMarker();
    });

    return markers.length;
  }
}

class Player {
  constructor(marker) {
    this.marker = marker;
  }

  getMarker() {
    return this.marker;
  }
}

class Human extends Player {
  // constructor() {
  //   // STUB
  // }
}

class Computer extends Player {
  // constructor() {
  //   // STUB
  // }
}

class TTTGame {
  static WINNING_ROWS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['1', '4', '7'],
    ['2', '5', '8'],
    ['3', '6', '9'],
    ['1', '5', '9'],
    ['3', '5', '7']
  ];

  constructor() {
    this.board = new Board();
    this.human = new Human(Square.HUMAN_MARKER);
    this.computer = new Computer(Square.COMPUTER_MARKER);
  }

  // eslint-disable-next-line max-statements
  play() {

    this.displayWelcomeMessage();
    readline.question('Press Enter/Return to continue...');

    while (true) {
      this.playOnce();

      if (!this.playAgain()) break;

      console.log(`Let's play again!`);
    }

    this.displayGoodbyeMessage();
  }

  playOnce() {
    this.board.reset();
    this.board.displayWithClear();

    while (true) {
      this.humanMoves();
      if (this.gameOver()) break;

      this.computerMoves();
      if (this.gameOver()) break;

      this.board.displayWithClear();
    }

    this.board.displayWithClear();
    this.displayResults();
  }

  humanMoves() {
    let choice;
    const validChoices = this.board.unusedSquares();

    while (true) {
      const prompt = `Choose a square (${TTTGame.joinOr(validChoices)}): `;
      choice = readline.question(prompt);

      if (validChoices.includes(choice)) break;

      console.log('Sorry, that is not a valid choice.');
      console.log('');
    }

    // mark the selected square with the human marker
    this.board.markSquareAt(choice, this.human.marker);
  }

  computerMoves() {
    let choice = this.offensiveComputerMove();

    if (!choice) {
      choice = this.defensiveComputerMove();
    }

    if (!choice) {
      choice = this.chooseMiddleSquare();
    }

    if (!choice) {
      choice = this.chooseRandomSquare();
    }

    this.board.markSquareAt(choice, this.computer.marker);
  }

  offensiveComputerMove() {
    return this.findGameEndingSquare(this.computer);
  }

  defensiveComputerMove() {
    return this.findGameEndingSquare(this.human);
  }

  findGameEndingSquare(player) {
    for (let idx = 0; idx < TTTGame.WINNING_ROWS.length; idx++) {
      const row = TTTGame.WINNING_ROWS[idx];
      const sq = this.gameEndingSquare(row, player);
      if (sq) return sq;
    }

    return null;
  }

  gameEndingSquare(row, player) {
    if (this.board.countMarkersFor(player, row) === 2) {
      const emptySq = row.find(sq => this.board.isUnusedSquare(sq));

      if (emptySq !== undefined) {
        return emptySq;
      }
    }

    return null;
  }

  chooseMiddleSquare() {
    const midSqMarker = this.board.squares[Square.MIDDLE_SQUARE].getMarker();
    if (midSqMarker === Square.UNUSED_SQUARE) {
      return Square.MIDDLE_SQUARE;
    }

    return null;
  }

  chooseRandomSquare() {
    const choices = this.board.unusedSquares();
    return choices[Math.floor(Math.random() * choices.length)];
  }

  displayWelcomeMessage() {
    console.clear();
    console.log('Welcome to Tic Tac Toe!');
  }

  displayGoodbyeMessage() {
    console.log("Thanks for playing Tic Tac Toe! Goodbye!");
  }

  displayResults() {
    if (this.isWinner(this.human)) {
      console.log('You won! Congratulations!');
    } else if (this.isWinner(this.computer)) {
      console.log("I won! I won! Take that, human!");
    } else {
      console.log("Another tic tac toe game ends in a tie. How boring.");
    }
  }

  isWinner(player) {
    return TTTGame.WINNING_ROWS.some(row => {
      return this.board.countMarkersFor(player, row) === 3;
    });
  }

  gameOver() {
    return this.somebodyWon() || this.board.isFull();
  }

  somebodyWon() {
    return this.isWinner(this.computer) || this.isWinner(this.human);
  }

  static joinOr(arr, connector = ', ', conjunction = 'or') {
    if (arr.length <= 1) return arr.join();

    if (arr.length === 2) return `${arr[0]} ${conjunction} ${arr[1]}`;

    const allButLast = arr.slice(0, -1);
    return `${allButLast.join(connector)}${connector}${conjunction} ${arr[arr.length - 1]}`;
  }

  playAgain() {
    console.log('Would you like to play again? (y/n)');
    let response = readline.question().trim().toLowerCase();

    while (!['y', 'n'].includes(response)) {
      console.log("That's not a valid response. Please type y or n");
      response = readline.question().trim().toLowerCase();
    }

    return response === 'y';
  }
}

const game = new TTTGame();
game.play();