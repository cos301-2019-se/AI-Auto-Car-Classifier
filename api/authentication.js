var express = require('express');
const router = express.Router();
const { secret } = require('../config/config');
const passportJWT = require('passport-jwt');
let ExtractJwt = passportJWT.ExtractJwt;
const jwt = require('jsonwebtoken');
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = secret;

const db = require('../models/index');
const User = db.sequelize.models.User;

//login route
router.post('/login', async function(req, res, next) {
    const { name, email } = req.body;
    if (name && email) {
        try{
            let user = await User.findOne({ where: { email: email } });
            if (!user) {
                let newUser;
                await User.create({ name, email }).then(user => {
                    newUser = user;
                });
                let payload = { id: newUser.id };
                let token = jwt.sign(payload, jwtOptions.secretOrKey);
                res.setHeader('Set-Cookie', `Bearer=${token}; HttpOnly`);
                res.json({ success: 'logged in', token: token });
            } else {
                if (user.email === email) {
                    // from now on we'll identify the user by the id and the id is the 
                    // only personalized value that goes into our token
                    let payload = { id: user.id };
                    let token = jwt.sign(payload, jwtOptions.secretOrKey);
                    res.cookie('token', `Bearer=${token}; HttpOnly`, {httpOnly: true});
                    res.json({ success: 'logged in', token: token  });
                } else {
                    res.status(401).json({ message: 'Could not get credentials' });
                }
            }
        } catch(error){
            res.status(401).json({ message: 'Something went wrong', error: error });
        }
    }
  });

module.exports = router;