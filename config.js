const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  DB_CONNECTION: process.env.DB_CONNECTION,
};
