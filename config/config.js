const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  host: process.env.HOST,
  port: process.env.PORT,
  node_env: process.env.NODE_ENV,
  secret: process.env.SECRET
};