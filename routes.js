
const express = require("express")
const path = require("path")

module.exports = (app) => {
  app.use(express.json())
  app.use(express.raw())
  app.use(express.urlencoded({ extended: true }))

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"))
  })

  app.get("/:path", (req, res) => {
    res.sendFile(path.join(__dirname, `/public/${req.params.path}`))
  })


  app.post("/create_lobby", (req, res) => {
    console.log(req.body)
    res.redirect("/")
  })
}