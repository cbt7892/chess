var board = null
var game = new Chess()

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false
}

function getScore(game1) {
  var board = game1.board();
  var score = 0;
  var values = {
    "p" : 100,
    "n" : 300,
    "b" : 320,
    "r" : 500,
    "q" : 900,
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

function minimax(depth, curGame, alpha, beta, black) {
  if (depth == 0) {
    return getScore(curGame);
  }
  var possible = curGame.moves();
  if (possible.length == 0) {
    return getScore(curGame);
  }
  if (black) {
    var best = -99999;
    for (var i = 0; i < possible.length; i++) {
      curGame.move(possible[i]);
      best = Math.max(best, minimax(depth - 1, curGame, alpha, beta, false));
      curGame.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) {
        return best;
      }
    }
    return best;
  }
  else {
    var best = 99999;
    for (var i = 0; i < possible.length; i++) {
      curGame.move(possible[i]);
      best = Math.min(best, minimax(depth - 1, curGame, alpha, beta, true));
      curGame.undo();
      beta = Math.min(beta, best);
      if (beta <= alpha) {
        return best;
      }
    }
    return best;
  }
}

function makeGoodMove (depth) {
  var possibleMoves = game.moves()
  var best = null;
  var bestScore = -99999;

  // game over
  if (possibleMoves.length == 0) {
    return
  }

  for (var i = 0; i < possibleMoves.length; i++) {
    var possibleMove = possibleMoves[i];
    game.move(possibleMove);
    var score = minimax(depth - 1, game, -99999, 99999, false);
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

  window.setTimeout(makeGoodMove(3), 250)
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

jQuery('#board').on('scroll touchmove touchend touchstart contextmenu', function(e){
  e.preventDefault();
});
