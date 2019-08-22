const passport = require('passport');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;

const { secret } = require('../config/config');

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = secret;

const db = require('../models/index');
const User = db.sequelize.models.User;

let strategy = new JwtStrategy(jwtOptions, async function(jwt_payload, done) {
  console.log(jwt_payload)
  let user;
  try{
    user = await User.findOne({ where: {id: jwt_payload.id} });
  } catch(e){
    console.log('Error forwarding user object in middleware')
  }
  if (user) {
    done(null, user);
  } else {
    done(null, false);
  }
});

passport.use(strategy);

module.exports = passport;