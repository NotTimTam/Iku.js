const builder = require("../Iku/builder.js");
const { readFileSync } = require("fs-extra");

builder.build(JSON.parse(readFileSync("./settings.json")));
