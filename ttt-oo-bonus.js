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
  static HORIZONTAL_SPACE = 12;

  constructor() {
    this.reset();
  }

  reset() {
    this.squares = {};

    for (let count = 1; count <= 9; count++) {
      this.squares[String(count)] = new Square();
    }
  }

  logWithSpace(text, spaceLength) {
    console.log(`${' '.repeat(spaceLength)}${text}`);
  }

  display() {
    this.logWithSpace('');
    this.logWithSpace("     |     |", Board.HORIZONTAL_SPACE);
    this.logWithSpace(`  ${this.squares["1"]}  |  ${this.squares["2"]}  |  ${this.squares["3"]}`, Board.HORIZONTAL_SPACE);
    this.logWithSpace("     |     |", Board.HORIZONTAL_SPACE);
    this.logWithSpace("-----+-----+-----", Board.HORIZONTAL_SPACE);
    this.logWithSpace("     |     |", Board.HORIZONTAL_SPACE);
    this.logWithSpace(`  ${this.squares["4"]}  |  ${this.squares["5"]}  |  ${this.squares["6"]}`, Board.HORIZONTAL_SPACE);
    this.logWithSpace("     |     |", Board.HORIZONTAL_SPACE);
    this.logWithSpace("-----+-----+-----", Board.HORIZONTAL_SPACE);
    this.logWithSpace("     |     |", Board.HORIZONTAL_SPACE);
    this.logWithSpace(`  ${this.squares["7"]}  |  ${this.squares["8"]}  |  ${this.squares["9"]}`, Board.HORIZONTAL_SPACE);
    this.logWithSpace("     |     |", Board.HORIZONTAL_SPACE);
    this.logWithSpace("");
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
    this.score = 0;
  }

  getMarker() {
    return this.marker;
  }

  getScore() {
    return this.score;
  }

  incrementScore() {
    this.score += 1;
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

  static GAME_WINS_PER_MATCH = 3;
  static PLAYS_FIRST = 'choose';

  constructor() {
    this.board = new Board();
    this.human = new Human(Square.HUMAN_MARKER);
    this.computer = new Computer(Square.COMPUTER_MARKER);
  }

  // eslint-disable-next-line max-statements
  play() {
    this.displayWelcomeMessage();
    this.playMatch();
    this.displayGoodbyeMessage();
  }

  playMatch() {
    let firstPlayer = this.getFirstPlayer();

    while (true) {
      this.playRound(firstPlayer);

      if (this.someoneWonRound()) {
        this.processRoundWin();

        if (this.someoneWonMatch()) {
          this.processMatchWin();
          break;
        }
      } else {
        console.log(`It's a tie.`);
      }

      console.log('');
      console.log(this.getScoresStr());
      if (!this.playAgain()) break;

      firstPlayer = this.alternatePlayer(firstPlayer);
    }
  }

  playRound(firstPlayer) {
    this.board.reset();
    let currentPlayer = firstPlayer;

    while (true) {
      this.displayScoresWithBorder();
      this.board.display();

      this.chooseSquare(currentPlayer);
      if (this.gameOver()) break;

      currentPlayer = this.alternatePlayer(currentPlayer);
    }

    this.board.displayWithClear();
  }

  getFirstPlayer() {
    let first;
    if (TTTGame.PLAYS_FIRST === 'choose') {
      console.clear();
      console.log('Choose who you would like to go first: human(h) or computer(c):');
      first = readline.question().trim().toLowerCase();

      while (!['h', 'c', 'human', 'computer'].includes(first)) {
        console.log("Invalid response. Please choose human (h) or computer (c):");
        first = readline.question().trim().toLowerCase();
      }

      if (first === 'h') {
        first = this.human;
      } else if (first ===  'c') {
        first = this.computer;
      }
    } else {
      first = TTTGame.PLAYS_FIRST === 'computer' ? this.computer : this.human;
    }

    return first;
  }

  chooseSquare(currentPlayer) {
    if (currentPlayer === this.human) {
      this.humanMoves();
    } else if (currentPlayer === this.computer) {
      this.computerMoves();
    }
  }

  alternatePlayer(current) {
    return current === this.human ? this.computer : this.human;
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
    console.log(`First to win ${TTTGame.GAME_WINS_PER_MATCH} rounds wins match.`);
    console.log('');
    readline.question('Press Enter/Return to continue...');
  }

  displayGoodbyeMessage() {
    console.log("Thanks for playing Tic Tac Toe! Goodbye!");
  }

  processRoundWin() {
    const winner = this.detectRoundWinner();

    this.displayRoundWinner(winner);
    winner.incrementScore();
  }

  displayRoundWinner(player) {
    const roundWinner = player === this.human ? 'You' : 'Computer';
    console.log(`${roundWinner} won the round!`);
  }

  isRoundWinner(player) {
    return TTTGame.WINNING_ROWS.some(row => {
      return this.board.countMarkersFor(player, row) === 3;
    });
  }

  detectRoundWinner() {
    if (this.isRoundWinner(this.human)) {
      return this.human;
    } else if (this.isRoundWinner(this.computer)) {
      return this.computer;
    }

    return null;
  }

  processMatchWin() {
    console.log(this.getScoresStr());
    this.displayMatchWinner();
  }

  displayMatchWinner() {
    const winner = this.detectMatchWinner() === this.human ? 'You' : 'Computer';
    console.log(`${winner} won the match!!!`);
  }

  detectMatchWinner() {
    if (this.human.getScore() >= TTTGame.GAME_WINS_PER_MATCH) {
      return this.human;
    } else if (this.computer.getScore() >= TTTGame.GAME_WINS_PER_MATCH) {
      return this.computer;
    }

    return null;
  }

  someoneWonMatch() {
    return !!this.detectMatchWinner();
  }

  gameOver() {
    return this.someoneWonRound() || this.board.isFull();
  }

  someoneWonRound() {
    return this.detectRoundWinner() !== null;
  }

  getScoresStr() {
    const humanScore = this.human.getScore();
    const compScore = this.computer.getScore();
    return `You (X): ${humanScore}  |  Computer (O): ${compScore}`;
  }

  displayScoresWithBorder() {
    console.clear();

    console.log(`|        (First to ${TTTGame.GAME_WINS_PER_MATCH} points wins)        |`);
    console.log('|                                        |');
    console.log(`|     ${this.getScoresStr()}     |`);
    console.log('******************************************');
  }

  playAgain() {
    console.log('');
    console.log('Are you ready to move to the next round? (y/n)');
    let response = readline.question().trim().toLowerCase();

    while (!['y', 'n'].includes(response)) {
      console.log("That's not a valid response. Please type y or n");
      response = readline.question().trim().toLowerCase();
    }

    return response === 'y';
  }

  static joinOr(arr, connector = ', ', conjunction = 'or') {
    if (arr.length <= 1) return arr.join();

    if (arr.length === 2) return `${arr[0]} ${conjunction} ${arr[1]}`;

    const allButLast = arr.slice(0, -1);
    return `${allButLast.join(connector)}${connector}${conjunction} ${arr[arr.length - 1]}`;
  }
}

const game = new TTTGame();
game.play();

// SCORES
// - initialize score properties
// - display score
// - process round win
//  - function for incrementing scores
// - detect if someone won match
// - detect match winner
// - process match win
//