const express = require("express")
const path = require("path")

const lobbies = require("./lobbies.js")

module.exports = (app) => {
  app.use(express.json())
  app.use(express.raw())
  app.use(express.urlencoded({ extended: true }))

  const cwd = process.cwd() // directory of where server.js is

  app.get("/", (req, res) => {
    res.sendFile(path.join(cwd, "/public/index.html"))
  })

  app.get("/:path", (req, res) => {
    res.sendFile(path.join(cwd, `/public/${req.params.path}`))
  })


  app.post("/create_lobby", (req, res) => {
    console.log(req.body)

    lobbies.createLobby(req.body)
  
    res.redirect("/")
  })
}