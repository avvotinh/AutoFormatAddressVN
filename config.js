// config.js
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  GOOGLE_MAP_AUTOCOMPLETE_API: process.env.GOOGLE_MAP_AUTOCOMPLETE_API,
  GOOGLE_MAP_PLACE_API: process.env.GOOGLE_MAP_PLACE_API,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  PORT: process.env.PORT,
};
