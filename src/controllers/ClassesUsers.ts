import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { UserProps } from '../db/migrations/00_create_users'
import unprocessableEntity from '../utils/unprocessableEntity'
import db from '../db/connection'

const saltRounds = 11

export default class UsersController {
  async index(request: Request, response: Response) {
    const params = request.body as UserProps

    const result = await db('users').where('email', params.email)
    if (result.length === 0) {
      return unprocessableEntity(response, 'User not found')
    }

    const { password, ...user } = result[0] as UserProps
    const passwordsMatch = await bcrypt.compare(params.password, password)

    if (!passwordsMatch) {
      return unprocessableEntity(response, 'E-mail/password could be wrong')
    }

    const secret = process.env.SECRET as string
    const token = jwt.sign(user, secret)

    return response.json({ ...user, token })
  }

  async create(request: Request, response: Response) {
    const params = request.body as UserProps

    const isEmailAlreadyUsed = await UsersController.isEmailAlreadyUsed(params.email)
    if (isEmailAlreadyUsed) {
      return unprocessableEntity(response, 'E-mail already used')
    }

    try {
      bcrypt.hash(params.password, saltRounds)
        .then(async (hash) => {
          const insertedUser = await db('users').insert({ ...params, password: hash })
          return response.status(200).json({ id: insertedUser[0] })
        })
        .catch((e) => {
          console.error(e)
          return unprocessableEntity(response)
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
