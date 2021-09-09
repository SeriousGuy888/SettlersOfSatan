module.exports = {
  pages: {
    index: {
      entry: "src/pages/Home/main.js",
      template: "public/index.html",
      title: "Satan But Vue",
      chunks: ["chunk-vendors", "chunk-common", "index"]
    },
    // contributors: {
    //   entry: "src/pages/Home/main.js",
    //   template: "public/index.html",
    //   title: "Satan But Vue",
    //   chunks: ["chunk-vendors", "chunk-common", "index"]
    // },
  }
}