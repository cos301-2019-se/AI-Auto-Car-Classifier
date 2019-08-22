const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  username: process.env.API_URL,
  password: process.env.API_KEY,
  database: process.env.DATABASE,
  host: process.env.HOST,
  port: process.env.PORT,
  node_env: process.env.NODE_ENV,
  secret: process.env.SECRET
};