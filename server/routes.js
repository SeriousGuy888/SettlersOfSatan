const express = require("express")
const path = require("path")

/**
 * 
 * @param {express.Express} app 
 */
module.exports = (app) => {
  app.use(express.json())
  app.use(express.raw())
  app.use(express.urlencoded({ extended: true }))

  const publicDir = path.join(process.cwd(), "/public")
  app.get("/credits", (req, res) => {
    res.sendFile(path.join(publicDir, "/credits.html"))
  })


  app.use(express.static("public"))
}