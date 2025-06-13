const PocketBase = require("pocketbase/cjs");

const pb = new PocketBase("http://127.0.0.1:8090");
const tokenBlacklist = new Set();

module.exports = { pb, tokenBlacklist };
