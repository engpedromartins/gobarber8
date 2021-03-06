const { Router } = require('express');
import multer from 'multer';
import multerConfig from './config/multer'

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileControler from './app/controllers/FileController';
import authMiddlewares from './app/middlewares/auth'
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';

const routes = new Router();
const upload = multer(multerConfig)

routes.get('/', (req, res) => {
  res.status(200).json({ message: 'Servidor upzeiro' })
})
routes.post('/users', UserController.store)
routes.post('/sessions', SessionController.store)

routes.use(authMiddlewares)

routes.put('/users', UserController.update)
routes.get('/providers', ProviderController.index)
routes.get('/providers/:providerId/available', AvailableController.index)

routes.get('/appointments', AppointmentController.index)
routes.post('/appointments', AppointmentController.store)
routes.delete('/appointments/:id', AppointmentController.delete)

routes.get('/schedule', ScheduleController.index)

routes.get('/notifications', NotificationController.index)
routes.put('/notifications/:id', NotificationController.update)

routes.post('/files', upload.single('file'), FileControler.store)

export default routes;
