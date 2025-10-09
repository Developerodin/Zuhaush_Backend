import express from 'express';
import authRoute from './auth.route.js';
import userRoute from './user.route.js';
import builderRoute from './builder.route.js';
import propertyRoute from './property.route.js';
import adminRoute from './admin.route.js';
import visitRoute from './visit.route.js';
import propertyViewRoute from './propertyView.route.js';
import chatRoute from './chat.route.js';
import commonRoute from './common.route.js';
import likeRoute from './like.route.js';
import commentRoute from './comment.route.js';
import notificationRoute from './notification.route.js';
import docsRoute from './docs.route.js';
import config from '../../config/config.js';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/builders',
    route: builderRoute,
  },
  {
    path: '/properties',
    route: propertyRoute,
  },
  {
    path: '/admins',
    route: adminRoute,
  },
  {
    path: '/visits',
    route: visitRoute,
  },
  {
    path: '/property-views',
    route: propertyViewRoute,
  },
  {
    path: '/chat',
    route: chatRoute,
  },
  {
    path: '/file',
    route: commonRoute,
  },
  {
    path: '/',
    route: likeRoute,
  },
  {
    path: '/',
    route: commentRoute,
  },
  {
    path: '/notifications',
    route: notificationRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
