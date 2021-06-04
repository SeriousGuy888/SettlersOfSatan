const express = require("express")
const path = require("path")

const lobbies = require("./lobbies.js")

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

  app.get("/:path", (req, res) => {
    res.sendFile(path.join(publicDir, `/${req.params.path}`))
  })


  app.post("/create_lobby", (req, res) => {
    const lobbyData = {}
    lobbyData.name = req.body.lobbyName
    lobbyData.players = [req.body.nickname]

    if(!lobbyData.name || !lobbyData.players.length) {
      res.sendStatus(400)
      return
    }

    lobbies.createLobby(lobbyData)
    res.redirect("/")
  })
}