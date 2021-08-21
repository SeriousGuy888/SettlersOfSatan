const express = require("express")
const serveStatic = require("serve-static");
const routingUtil = require("./routing_util.js")
const { pathTo } = routingUtil

const serverStats = require("./server_stats.js")
const infoPages = require("./info_pages.js")

/**
 * @param {express.Express} app 
 */
module.exports = (app) => {
  app.use(express.json())
  app.use(express.raw())
  app.use(express.urlencoded({ extended: true }))

  app.get("/vue", (req, res) => res.sendFile(pathTo("/vue.html")))
  app.use(express.static("dist"))
  
  app.use(express.static("old_public"))
  app.use("/", serverStats)
  app.use("/", infoPages)
  
  app.get("/settings", (req, res) => res.sendFile(pathTo("/settings.html")))

  app.get("/credits", (req, res) => res.redirect("/contributors"))
  app.get("/:oeuf(contributors|kontributeurs)*", (req, res) => res.sendFile(pathTo("/contributors/contributors.html")))

  app.use((req, res) => res.status(404).sendFile(pathTo("/404.html")))
}