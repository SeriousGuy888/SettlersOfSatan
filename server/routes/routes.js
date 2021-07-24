const path = require("path")
const express = require("express")
const routingUtil = require("./routing_util.js")
const { publicDir } = routingUtil

const serverStats = require("./server_stats.js")

/**
 * @param {express.Express} app 
 */
module.exports = (app) => {
  app.use(express.json())
  app.use(express.raw())
  app.use(express.urlencoded({ extended: true }))
  
  app.use(express.static("public"))
  
  app.get("/credits", (req, res) => res.redirect("/contributors"))
  app.get("/:oeuf(contributors|kontributeurs)*", (req, res) => res.sendFile(path.join(publicDir, "/contributors/contributors.html")))

  app.use("/", serverStats)
}