const path = require("path")

module.exports.publicDir = path.join(process.cwd(), "/public")
module.exports.distPath = (fileName) => path.join(process.cwd(), "/dist", fileName)