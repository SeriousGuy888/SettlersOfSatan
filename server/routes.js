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

  app.use(express.static("public"))
}