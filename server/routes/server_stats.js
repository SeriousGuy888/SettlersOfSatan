const express = require("express")
const router = express.Router()

const routingUtil = require("./routing_util.js")
const { distPath } = routingUtil


router.get("/stats", (req, res) => res.sendFile(distPath("/stats.html")))
router.get("/stats/get", (req, res) => {
  const memoryUsage = process.memoryUsage()
  const uptime = Math.floor(process.uptime())

  res.json({
    memoryUsage,
    uptime,
  })
})

module.exports = router