exports.actionTimers = {
  roll_dice: 10,
  discard: 25,
  build: 95,
}

exports.buildingCosts = {
  road: {
    bricks: 1,
    lumber: 1,
  },
  settlement: {
    bricks: 1,
    lumber: 1,
    wheat: 1,
    wool: 1,
  },
  city: {
    wheat: 2,
    ore: 3,
  },
  developmentCard: {
    wool: 1,
    wheat: 1,
    ore: 1
  }
}

exports.hexTypesResources = {
  mud: "bricks",
  forest: "lumber",
  mountain: "ore",
  farm: "wheat",
  pasture: "wool",
  desert: null
}