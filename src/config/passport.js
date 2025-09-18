import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import config from './config.js';
import { tokenTypes } from './tokens.js';
import User from '../models/user.model.js';
import Admin from '../models/admin.model.js';
import Builder from '../models/builder.model.js';


const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const adminJwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const admin = await Admin.findById(payload.sub);
    if (!admin) {
      return done(null, false);
    }
    done(null, admin);
  } catch (error) {
    done(error, false);
  }
};

const builderJwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const builder = await Builder.findById(payload.sub);
    if (!builder) {
      return done(null, false);
    }
    done(null, builder);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
const adminJwtStrategy = new JwtStrategy(jwtOptions, adminJwtVerify);
const builderJwtStrategy = new JwtStrategy(jwtOptions, builderJwtVerify);

export { jwtStrategy, adminJwtStrategy, builderJwtStrategy };
