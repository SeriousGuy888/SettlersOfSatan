const express = require("express")
const router = express.Router()

const routingUtil = require("./routing_util.js")
const { distPath } = routingUtil

const constants = require("../constants.js")


router.get("/info/building_costs", (req, res) => res.sendFile(distPath("/info/building_costs.html")))
router.get("/info/building_costs/get", (req, res) => res.json(constants.buildingCosts))

module.exports = router