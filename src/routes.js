const { Router } = require('express');
import multer from 'multer';
import multerConfig from './config/multer'

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileControler from './app/controllers/FileController';
import authMiddlewares from './app/middlewares/auth'

const routes = new Router();
const upload = multer(multerConfig)

routes.post('/users', UserController.store)
routes.post('/sessions', SessionController.store)

routes.use(authMiddlewares)

routes.put('/users', UserController.update)

routes.post('/files', upload.single('file'), FileControler.store)

export default routes;
