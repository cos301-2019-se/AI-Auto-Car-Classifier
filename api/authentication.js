const passport = require('passport');
const request = require("request");

const express = require('express');
const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwtConfig');
const db = require('../models/index');
const User = db.sequelize.models.User;

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email } = req.body;
  
    // authentication will take approximately 13 seconds
    // https://pthree.org/wp-content/uploads/2016/06/bcrypt.png
    const hashCost = 10;
    
    try {
      //const passwordHash = await bcrypt.hash(password, hashCost);
      let newUser;
      console.warn(req.body);
      await User.create({ name, email }).then(user => {
        newUser = user;
      });
      
      res.status(200).send({ name: newUser.name });
      
     } catch (error) {
      res.status(400).send({
        error: 'req body should take the form { name, surname, email }',
        exception: error
      });
    }
  });
  
  router.post('/login', (req, res) => {
    passport.authenticate(
      'local',
      { session: false },
      (error, user) => {
  
        if (error || !user) {
          res.status(400).json({ error });
        }
  
        /** This is what ends up in our JWT */
        const payload = {
          email: user.email,
          expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),
        };
  
        /** assigns payload to req.user */
        req.login(payload, {session: false}, (error) => {
          if (error) {
            res.status(400).send({ error });
          }
  
          /** generate a signed json web token and return it in the response */
          const token = jwt.sign(JSON.stringify(payload), secret);
  
          /** assign our jwt to the cookie */
          res.cookie('jwt', jwt, { httpOnly: true, secure: true });
          res.status(200).send({ email });
        });
      },
    )(req, res);
  });

module.exports = router;