class Satan {
  constructor() {
    this.board = [
      [false, true, true, true, false],
      [true, true, true, true, false],
      [true, true, true, true, true],
      [true, true, true, true, false],
      [false, true, true, true, false],
    ]
  }

  getBoard() {
    return this.board
  }
}

module.exports = Satan