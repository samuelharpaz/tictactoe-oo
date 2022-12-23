const readline = require('readline-sync');
const shuffle = require('shuffle-array');
const chalk = require('chalk');

class Card {
  static SUITS = ['H', 'D', 'C', 'S'];
  static RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  static SUITS_KEY = {H: '\u2665', C: '\u2663', D: '\u2666', S: '\u2660'};

  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
    this.hidden = false;
  }

  getRank() {
    return this.rank;
  }

  getSuit() {
    return this.suit;
  }

  hide() {
    this.hidden = true;
  }

  reveal() {
    this.hidden = false;
  }

  isHidden() {
    return this.hidden;
  }

  getName() {
    const suit = this.getSuit();
    const suitSymbol = Card.SUITS_KEY[suit];

    if (this.isHidden()) {
      return '?';
    } else if (['H', 'D'].includes(suit)) {
      return `${this.getRank()}${chalk.red(suitSymbol)}`;
    } else {
      return `${this.getRank()}${chalk.white.bgGray(suitSymbol)}`;
    }
  }

  displayNew() {
    console.log(`New card: ${this.getName()}`);
    console.log('');
  }
}

class Deck {
  constructor() {
    this.initialize();
  }

  initialize() {
    this.cards = [];
    for (let suit of Card.SUITS) {
      for (let rank of Card.RANKS) {
        this.cards.push(new Card(suit, rank));
      }
    }

    this.shuffleCards();
  }

  shuffleCards() {
    shuffle(this.cards);
  }

  dealOne() {
    const dealt = this.cards.pop();

    if (this.cards.length === 0) {
      this.initialize();
    }

    return dealt;
  }

  dealOneFaceDown() {
    const dealt = this.dealOne();
    dealt.hide();
    return dealt;
  }
}

const Hand = {
  resetHand() {
    this.hand = [];
  },

  addToHand(card) {
    this.hand.push(card);
  },

  getHand() {
    if (this.numCards() === 2) {
      return `${this.hand[0].getName()} and ${this.hand[1].getName()}`;
    } else if (this.numCards() > 2) {
      return this.hand.map(card => card.getName()).join(', ');
    }

    return undefined;
  },

  numCards() {
    return this.hand.length;
  }
};

class Participant {
  constructor() {
    this.initialize();
  }

  initialize() {
    this.resetHand();
    this.busted = false;
    this.currentTotal = 0;
  }

  isBusted() {
    return this.busted;
  }

  setBusted() {
    this.busted = true;
  }

  getTotal() {
    return this.currentTotal;
  }

  displayCurrent(caption) {
    console.log(`${caption}: ${this.getHand()} (Current total: ${this.getTotal()})`);
  }
}

class Player extends Participant {
  static START_FUNDS = 5;
  // eslint-disable-next-line no-use-before-define
  static WINNING_FUNDS = Player.START_FUNDS * 2;
  static ROUND_BET = 1;

  constructor() {
    super();
    this.funds = Player.START_FUNDS;
  }

  getFunds() {
    return this.funds;
  }

  updateFunds(amount) {
    this.funds += amount;
  }

  isBroke() {
    return this.funds <= 0;
  }

  isRich() {
    return this.funds >= Player.WINNING_FUNDS;
  }

  winBet() {
    this.funds += Player.ROUND_BET;
  }

  loseBet() {
    this.funds -= Player.ROUND_BET;
  }

  displayFundsWithBorder() {
    console.clear();
    console.log('----------------------------------------------');
    console.log(`${this.getFundsStr()} ($${Player.WINNING_FUNDS} to win!)`);
    console.log('----------------------------------------------');
  }

  displayFunds() {
    console.log(this.getFundsStr());
  }

  getFundsStr() {
    return `Your current funds: $${this.getFunds()}`;
  }
}

class Dealer extends Participant {
  constructor() {
    super();
  }

  revealCard(card) {
    card.reveal();
  }
}

// Add min-in
Object.assign(Player.prototype, Hand);
Object.assign(Dealer.prototype, Hand);

class TwentyOneGame {
  static GAME_NAME = 'Twenty-One';
  static MAX_SCORE = 21;
  static DEALER_CUTOFF = 17;
  static KEY = `Key: J = Jack | Q = Queen | K = King | A = Ace`;

  constructor() {
    this.player = new Player();
    this.dealer = new Dealer();
  }

  initializeRound() {
    this.player.initialize();
    this.dealer.initialize();
  }

  play() {
    this.displayWelcomeMessage();

    while (true) {
      this.playRound();

      if (this.checkGameOver()) break;
      if (!this.playAgain()) break;
    }

    if (!this.checkGameOver()) {
      this.prompt(`You finished with $${this.player.getFunds()}`);
    } else {
      this.displayFinalResults();
    }

    this.displayGoodbyeMessage();
  }

  playRound() {
    this.initializeRound();
    this.displayGameInfo();

    this.dealInitialCards();
    this.calcAllTotals();

    this.showCards();
    this.playerTurn();
    this.dealerTurn();
    this.displayResults();
  }

  dealInitialCards() {
    this.deck = new Deck();

    this.player.hand.push(this.deck.dealOne());
    this.dealer.hand.push(this.deck.dealOneFaceDown());
    this.player.hand.push(this.deck.dealOne());
    this.dealer.hand.push(this.deck.dealOne());
  }

  showCards() {
    this.dealer.displayCurrent('Dealer has');
    this.player.displayCurrent('You have');
    this.addVerticalSpace();
  }

  promptHitStay() {
    this.prompt('Would you like to hit (h) or stay (s)?');
    let response = readline.question().trim().toLowerCase();

    while (!['h', 'hit', 's', 'stay'].includes(response)) {
      this.prompt("Oops, that's not a valid response. Please enter h for hit or s for stay:");
      response = readline.question().trim().toLowerCase();
    }

    return response;
  }

  hit(participant) {
    const newCard = this.deck.dealOne();
    newCard.displayNew();
    participant.addToHand(newCard);
    this.calcTotalFor(participant);
  }

  playerTurn() {
    while (true) {
      let response = this.promptHitStay();
      if (['s', 'stay'].includes(response)) break;

      this.displayGameInfo();
      this.prompt('You chose to hit.');
      this.hit(this.player);

      this.showCards();

      if (this.player.isBusted()) break;
    }

    if (!this.player.isBusted()) {
      this.displayGameInfo();
      this.prompt(`You chose to stay at ${this.player.getTotal()}`);
    }
  }

  dealerTurn() {
    this.dealer.revealCard(this.dealer.hand[0]);
    this.calcTotalFor(this.dealer);
    if (this.player.isBusted()) return;

    this.addVerticalSpace();
    this.prompt(`Dealer's turn:`);
    this.addVerticalSpace();

    this.showCards();

    while (this.dealer.getTotal() < TwentyOneGame.DEALER_CUTOFF) {
      this.addVerticalSpace();
      readline.question('Press Enter to continue...');

      this.displayGameInfo();
      this.prompt('Dealer hits');
      this.hit(this.dealer);

      this.showCards();
    }
  }

  calcTotalFor(participant) {
    const ACE_VALUE_DIFFERENCE = 10;

    const { hand } = participant;

    let sum = hand.reduce((total, curr) => {
      return total + this.valueOf(curr);
    }, 0);

    hand.filter(card => card.rank === 'A' && !card.isHidden()).forEach(_ => {
      if (sum > TwentyOneGame.MAX_SCORE) sum -= ACE_VALUE_DIFFERENCE;
    });

    participant.currentTotal = sum;

    if (sum > TwentyOneGame.MAX_SCORE) {
      participant.setBusted();
    }
  }

  calcAllTotals() {
    this.calcTotalFor(this.player);
    this.calcTotalFor(this.dealer);
  }

  valueOf(card) {
    const { rank } = card;

    if (card.isHidden()) return 0;
    if (rank === 'A') return 11;
    if (['J', 'Q', 'K'].includes(rank)) return 10;

    return +rank;
  }

  calcWinner() {
    const playerTotal = this.player.getTotal();
    const dealerTotal = this.dealer.getTotal();

    if (playerTotal > TwentyOneGame.MAX_SCORE) {
      return 'PLAYER_BUSTED';
    } else if (dealerTotal > TwentyOneGame.MAX_SCORE) {
      return 'DEALER_BUSTED';
    } else if (playerTotal > dealerTotal) {
      return 'PLAYER';
    } else if (playerTotal < dealerTotal) {
      return 'DEALER';
    } else {
      return 'DRAW';
    }
  }

  getResultStr() {
    const result = this.calcWinner();

    switch (result) {
      case 'PLAYER_BUSTED':
        return 'You busted. Dealer wins the round!';
      case 'DEALER_BUSTED':
        return 'Dealer busted. You win the round!';
      case 'PLAYER':
        return 'You win the round!';
      case 'DEALER':
        return 'Dealer wins the round!';
      case 'DRAW':
        return "This round is a draw.";
      default:
        return '';
    }
  }

  displayResults() {
    console.log('------------------------------------');
    this.addVerticalSpace();
    this.prompt(this.getResultStr());

    this.addVerticalSpace();
    console.log('Final Totals:');
    this.addVerticalSpace();
    console.log(`Dealer: ${this.dealer.getTotal()} (${this.dealer.getHand()})`);
    console.log(`Player: ${this.player.getTotal()} (${this.player.getHand()})`);
    this.addVerticalSpace();

    this.updatePlayerFunds();
    this.player.displayFunds();
  }

  displayFinalResults() {
    if (this.player.isRich()) {
      this.addVerticalSpace();
      this.prompt(`You win! 💰 Congratulations.`);
    } else {
      this.addVerticalSpace();
      this.prompt(`You ran out of money... 😢`);
    }
  }

  updatePlayerFunds() {
    const winner = this.calcWinner();

    if (['PLAYER', 'DEALER_BUSTED'].includes(winner)) {
      this.player.winBet();
    } else if (['DEALER', 'PLAYER_BUSTED'].includes(winner)) {
      this.player.loseBet();
    }
  }

  checkGameOver() {
    return this.player.isBroke() || this.player.isRich();
  }

  displayWelcomeMessage() {
    console.clear();
    this.prompt(`Welcome to ${TwentyOneGame.GAME_NAME}!`);
    this.addVerticalSpace();
    this.prompt(`You get $${Player.START_FUNDS} to start`);
    this.prompt(`For each round, you bet $${Player.ROUND_BET}. Win if you amass $${Player.WINNING_FUNDS}, lose if you hit $0.`);
    this.addVerticalSpace();
    this.prompt('Press Enter to continue...');
    readline.question();
  }

  playAgain() {
    this.prompt('Would you like to play again? (y/n)');
    let response = readline.question().trim().toLowerCase();

    while (!['yes', 'y', 'no', 'n'].includes(response)) {
      this.prompt('Invalid response. Please enter y for yes, or n for no');
      response = readline.question().trim().toLowerCase();
    }

    return ['y', 'yes'].includes(response);
  }

  displayGoodbyeMessage() {
    this.prompt(`Thanks for playing ${TwentyOneGame.GAME_NAME}. Have a lucky rest of your day!`);
  }

  displayGameInfo() {
    this.player.displayFundsWithBorder();
    console.log(TwentyOneGame.KEY);
    this.addVerticalSpace(2);
  }

  prompt(msg) {
    console.log(`=> ${msg}`);
  }

  addVerticalSpace(lines = 1) {
    for (let count = 1; count <= lines; count++) {
      console.log('');
    }
  }
}

const game = new TwentyOneGame();
game.play();