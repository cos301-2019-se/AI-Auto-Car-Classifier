const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  host: process.env.HOST,
  port: process.env.PORT,
  secret: process.env.SECRET,
  apiKey: process.env.APIKEY,
  authDomain: process.env.authDomain,
  dbUrl: process.env.FIREBASEDBURL,
  projectId: process.env.PROJECTID,
  senderId: process.env.SENDERID,
  appId: process.env.APPID,
  storageBucket: process.env.STORAGEBUCKET
};