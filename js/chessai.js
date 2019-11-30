var board = null
var game = new Chess()

function noScroll() {
  window.scrollTo(0, 0);
}

// add listener to disable scroll
window.addEventListener('scroll', noScroll);

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false
}

function getScore() {
  var board = game.board();
  var score = 0;
  var values = {
    "p" : 100,
    "n" : 350,
    "b" : 350,
    "r" : 525,
    "q" : 1000,
    "k" : 10000
  };
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      if (!board[i][j]) {continue;}
      var cur = board[i][j];
      if (cur["color"] == "b") {
        score += values[cur["type"]];
      }
      else {
        score -= values[cur["type"]];
      }
    }
  }
  return score;
}

function makeGoodMove () {
  var possibleMoves = game.moves()
  var best = null;
  var bestScore = -100000;

  // game over
  if (possibleMoves.length === 0) {
    return
  }

  for (var i = 0; i < possibleMoves.length; i++) {
    var possibleMove = possibleMoves[i];
    game.move(possibleMove);
    var score = getScore();
    game.undo();
    if (score > bestScore) {
      best = possibleMove;
      bestScore = score;
    }
  }
  game.move(best);
  board.position(game.fen())
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  // make random legal move for black
  window.setTimeout(makeGoodMove, 250)
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}

board = Chessboard('board', config);
