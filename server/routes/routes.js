const express = require("express")
const routingUtil = require("./routing_util.js")
const { pathTo } = routingUtil

const serverStats = require("./server_stats.js")

/**
 * @param {express.Express} app 
 */
module.exports = (app) => {
  app.use(express.json())
  app.use(express.raw())
  app.use(express.urlencoded({ extended: true }))
  
  app.use(express.static("public"))
  app.use("/", serverStats)
  
  app.get("/credits", (req, res) => res.redirect("/contributors"))
  app.get("/:oeuf(contributors|kontributeurs)*", (req, res) => res.sendFile(pathTo("/contributors/contributors.html")))

  app.use((req, res) => res.status(404).sendFile(pathTo("/404.html")))
}