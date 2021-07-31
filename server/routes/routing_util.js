const path = require("path")

module.exports.publicDir = path.join(process.cwd(), "/public")
module.exports.pathTo = (fileName) => path.join(this.publicDir, fileName)