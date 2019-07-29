const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
//const bcrypt = require('bcrypt'); encryption for passwords, not needed

const { secret } = require('../config/jwtConfig');

const UserModel = require('./models/user');

passport.use(new LocalStrategy({
  emailField: email,
  //passwordField: password,
}, async (email,done) => {
  try {
    const userDocument = await UserModel.findOne({email: email}).exec();
    //const passwordsMatch = await bcrypt.compare(password, userDocument.passwordHash);

    if (!userDocument) {
      return done(null, userDocument);
    } else {
        //user exists, return a jwt token
      return done('Incorrect Username / Password');
    }
  } catch (error) {
    done(error);
  }
}));

passport.use(new JWTStrategy({
    jwtFromRequest: req => req.cookies.jwt,
    secretOrKey: secret,
  },
  (jwtPayload, done) => {
    if (Date.now() > jwtPayload.expires) {
      return done('jwt expired');
    }

    return done(null, jwtPayload);
  }
));