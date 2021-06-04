const express = require("express")
const path = require("path")

module.exports = (app) => {
  app.use(express.json())
  app.use(express.raw())
  app.use(express.urlencoded({ extended: true }))

  const cwd = process.cwd() // directory of where server.js is
  const publicDir = path.join(cwd, "/public")

  app.get("/", (req, res) => {
    res.sendFile(path.join(publicDir, "/index.html"))
  })

  app.get("/lobby", (req, res) => {
    res.sendFile(path.join(publicDir, "/lobby.html"))
  })

  app.get("/images/:path", (req, res) => {
    res.sendFile(path.join(publicDir, `/images/${req.params.path}`))
  })

  app.get("/:path", (req, res) => {
    res.sendFile(path.join(publicDir, `/${req.params.path}`))
  })
}