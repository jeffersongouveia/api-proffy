import express from 'express'

import ClassesController from './controllers/ClassesController'
import ConnectionsController from './controllers/ConnectionsController'
import UsersController from './controllers/ClassesUsers'

const routes = express.Router()
const usersController = new UsersController()
const classesController = new ClassesController()
const connectionsController = new ConnectionsController()

routes.post('/users/sign-up', usersController.create)

routes.get('/classes', classesController.index)
routes.post('/classes', classesController.create)

routes.get('/connections', connectionsController.index)
routes.post('/connections', connectionsController.create)

export default routes
