const express = require("express")
const routingUtil = require("./routing_util.js")
const { distPath } = routingUtil

const serverStats = require("./server_stats.js")
const infoPages = require("./info_pages.js")

/**
 * @param {express.Express} app 
 */
module.exports = (app) => {
  app.use(express.json())
  app.use(express.raw())
  app.use(express.urlencoded({ extended: true }))


  app.use(express.static("dist"))

  app.get("/contributors", (req, res) => res.redirect("/about"))
  app.get("/about", (req, res) => res.sendFile(distPath("/about.html")))

  app.use("/", serverStats)
  app.use("/", infoPages)

  app.use((req, res) => res.status(404).sendFile(distPath("/404.html")))
}