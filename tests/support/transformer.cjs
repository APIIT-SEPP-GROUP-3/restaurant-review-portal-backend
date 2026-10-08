// Reuse the project's Babel TypeScript preset; preserve native ESM for Jest.
module.exports = {
  getCacheKey(source, filename, options) {
    const { createHash } = require("node:crypto");
    const { readFileSync } = require("node:fs");
    return createHash("sha256").update(source).update(filename)
      .update(options.configString).update(readFileSync(__filename)).digest("hex");
  },
  async processAsync(source, filename) {
    const { transformAsync } = await import("@babel/core");
    const result = await transformAsync(source, {
      filename,
      babelrc: false,
      configFile: false,
      presets: [["@babel/preset-typescript", { onlyRemoveTypeImports: false }]],
      sourceMaps: "inline",
    });
    return { code: result.code };
  },
};
