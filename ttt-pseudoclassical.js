const readline = require('readline-sync');

function Square(marker = Square.UNUSED_SQUARE) {
  this.marker = marker;
}

Square.UNUSED_SQUARE = ' ';
Square.HUMAN_MARKER = 'X';
Square.COMPUTER_MARKER = 'O';

const squareMethods = {
  toString() {
    return this.marker;
  },

  getMarker() {
    return this.marker;
  },

  setMarker(marker) {
    this.marker = marker;
  },

  isAvailable() {
    return this.marker === Square.UNUSED_SQUARE;
  }
};

Object.assign(Square.prototype, squareMethods);

function Board() {
  this.squares = {};

  for (let count = 1; count <= 9; count++) {
    this.squares[String(count)] = new Square();
  }
}

const boardMethods = {
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
  },

  displayWithClear() {
    console.clear();
    console.log('');
    console.log('');
    this.display();
  },

  markSquareAt(sqNum, marker) {
    this.squares[String(sqNum)].setMarker(marker);
  },

  unusedSquares() {
    const keys = Object.keys(this.squares);
    return keys.filter(key => this.squares[key].isAvailable());
  },

  isFull() {
    return this.unusedSquares().length === 0;
  },

  countMarkersFor(player, keys) {
    const markers = keys.filter(key => {
      return this.squares[key].getMarker() === player.getMarker();
    });

    return markers.length;
  }
};

Object.assign(Board.prototype, boardMethods);

function Player(marker) {
  this.marker = marker;
}

Player.prototype.getMarker = function() {
  return this.marker;
};

function Human() {
  Player.call(this, Square.HUMAN_MARKER);
}

Human.prototype = Object.create(Player.prototype);
Human.prototype.constructor = Human;

function Computer() {
  Player.call(this, Square.COMPUTER_MARKER);
}

Computer.prototype = Object.create(Player.prototype);
Computer.prototype.constructor = Computer;

function TTTGame() {
  this.board = new Board();
  this.human = new Human();
  this.computer = new Computer();
}

TTTGame.WINNING_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['1', '4', '7'],
  ['2', '5', '8'],
  ['3', '6', '9'],
  ['1', '5', '9'],
  ['3', '5', '7']
];

const gameMethods = {
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
  },

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
  },

  computerMoves() {
    const choices = this.board.unusedSquares();

    const choice = choices[Math.floor(Math.random() * choices.length)];
    this.board.markSquareAt(choice, this.computer.marker);
  },

  displayWelcomeMessage() {
    console.clear();
    console.log('Welcome to Tic Tac Toe!');
    console.log('');
  },

  displayGoodbyeMessage() {
    console.log("Thanks for playing Tic Tac Toe! Goodbye!");
  },

  displayResults() {
    if (this.isWinner(this.human)) {
      console.log('You won! Congratulations!');
    } else if (this.isWinner(this.computer)) {
      console.log("I won! I won! Take that, human!");
    } else {
      console.log("Another tic tac toe game ends in a tie. How boring.");
    }
  },

  isWinner(player) {
    return TTTGame.WINNING_ROWS.some(row => {
      return this.board.countMarkersFor(player, row) === 3;
    });
  },

  gameOver() {
    return this.somebodyWon() || this.board.isFull();
  },

  somebodyWon() {
    return this.isWinner(this.computer) || this.isWinner(this.human);
  }
};

Object.assign(TTTGame.prototype, gameMethods);

const game = new TTTGame();
game.play();