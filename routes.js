const path = require("path")

module.exports = (app) => {
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"))
  })

  app.get("/:path", (req, res) => {
    res.sendFile(path.join(__dirname, `/public/${req.params.path}`))
  })


  app.get("/:path", (req, res) => {
    res.sendFile(path.join(__dirname, `/public/${req.params.path}`))
  })
}