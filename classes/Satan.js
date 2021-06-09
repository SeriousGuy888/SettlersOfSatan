class Satan {
  constructor() {
    this.grid = [
      [false, true, true, true, false],
      [true, true, true, true, false],
      [true, true, true, true, true],
      [true, true, true, true, false],
      [false, true, true, true, false],
    ]
  }

  getGrid() {
    return this.grid
  }
}

module.exports = Satan