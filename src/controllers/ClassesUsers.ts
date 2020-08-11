import { Request, Response } from 'express'

import { UserProps } from '../db/migrations/00_create_users'
import unprocessableEntity from '../utils/unprocessableEntity'
import db from '../db/connection'

export default class UsersController {
  async index(request: Request, response: Response) {
  }

  async create(request: Request, response: Response) {
    const params = request.body as UserProps

    const isEmailAlreadyUsed = await UsersController.isEmailAlreadyUsed(params.email)
    if (isEmailAlreadyUsed) {
      return unprocessableEntity(response, 'E-mail already used')
    }

    try {
      const insertedUser = await db('users').insert(params)
      return response.status(200).json({
        id: insertedUser[0],
      })
    } catch (e) {
      console.error(e)
      return unprocessableEntity(response)
    }
  }

  private static async isEmailAlreadyUsed(email: string) {
    const result = await db('users')
      .count('* as count')
      .where('email', email)

    return result[0].count > 0
  }
}
