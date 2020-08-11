import express from 'express'
import dotenv from 'dotenv'

import { authenticateToken } from './middleware'

import ClassesController from './controllers/ClassesController'
import ConnectionsController from './controllers/ConnectionsController'
import UsersController from './controllers/ClassesUsers'

dotenv.config()

const routes = express.Router()
const usersController = new UsersController()
const classesController = new ClassesController()
const connectionsController = new ConnectionsController()

routes.post('/users/sign-up', usersController.create)
routes.post('/users/log-in', usersController.index)

routes.get('/classes', authenticateToken, classesController.index)
routes.post('/classes', authenticateToken, classesController.create)

routes.get('/connections', authenticateToken, connectionsController.index)
routes.post('/connections', authenticateToken, connectionsController.create)

export default routes
