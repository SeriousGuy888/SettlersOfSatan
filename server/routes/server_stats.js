const path = require("path")
const express = require("express")
const router = express.Router()

const routingUtil = require("./routing_util.js")
const { publicDir } = routingUtil


router.get("/stats", (req, res) => res.sendFile(path.join(publicDir, "/stats.html")))
router.get("/stats/get", (req, res) => {
  const memoryUsage = process.memoryUsage()

  res.json({
    memoryUsage,
  })
})

module.exports = router