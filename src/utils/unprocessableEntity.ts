import { Response } from 'express'

export default function unprocessableEntity(response: Response, message?: string) {
  return response.status(422).json({
    error: message || 'Unexpected error while processing you request',
  })
}
