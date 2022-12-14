const readline = require('readline-sync');

class Square {
  static UNUSED_SQUARE = ' ';
  static HUMAN_MARKER = 'X';
  static COMPUTER_MARKER = 'O';

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
    console.log('');
    console.log('');
    this.display();
  }

  markSquareAt(sqNum, marker) {
    this.squares[String(sqNum)].setMarker(marker);
  }

  unusedSquares() {
    const keys = Object.keys(this.squares);
    return keys.filter(key => this.squares[key].isAvailable());
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

  play() {
    // SPIKE
    this.displayWelcomeMessage();
    // readline.question('Press Enter/Return to continue...')
    this.board.display();

    while (true) {
      this.humanMoves();
      if (this.gameOver()) break;

      this.computerMoves();
      if (this.gameOver()) break;

      this.board.displayWithClear();
    }

    this.board.displayWithClear();
    this.displayResults();
    this.displayGoodbyeMessage();
  }

  humanMoves() {
    let choice;
    const validChoices = this.board.unusedSquares();

    while (true) {
      const prompt = `Choose a square (${validChoices.join(', ')}): `;
      choice = readline.question(prompt);

      if (validChoices.includes(choice)) break;

      console.log('Sorry, that is not a valid choice.');
      console.log('');
    }

    // mark the selected square with the human marker
    this.board.markSquareAt(choice, this.human.marker);
  }

  computerMoves() {
    const choices = this.board.unusedSquares();

    const choice = choices[Math.floor(Math.random() * choices.length)];
    this.board.markSquareAt(choice, this.computer.marker);
  }

  displayWelcomeMessage() {
    console.clear();
    console.log('Welcome to Tic Tac Toe!');
    console.log('');
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
}

const game = new TTTGame();
game.play();