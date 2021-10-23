module.exports = {
  pages: {
    "index": {
      entry: "./src/pages/Home/home.js",
      template: "public/index.html",
      chunks: ["chunk-vendors", "chunk-common", "index"]
    },
    "about": {
      entry: "./src/pages/About/about.js",
      template: "public/about.html",
      chunks: ["chunk-vendors", "chunk-common", "about"]
    },
  },
}