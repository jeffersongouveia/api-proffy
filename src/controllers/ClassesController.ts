import { Request, Response } from 'express'

import { ScheduleProps } from '../db/migrations/03_create_class_schedule'
import convertHoursToMinutes from '../utils/convertHoursToMinutes'
import unprocessableEntity from '../utils/unprocessableEntity'
import db from '../db/connection'

export default class ClassesController {
  async index(request: Request, response: Response) {
    const filters = request.query

    const subject = filters.subject as string
    const weekDay = filters.week_day as string
    const time = filters.time as string

    const classes = await db('classes')
      .whereExists(function() {
        this.select('class_schedule.*')
          .from('class_schedule')
          .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
          .modify((query) => {
            if (weekDay) {
              query.whereRaw('`class_schedule`.`week_day` = ??', [Number(weekDay)])
            }
            if (time) {
              const timeInMinutes = convertHoursToMinutes(time)
              query.whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
              query.whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
            }
          })
      })
      .modify((query) => {
        if (subject) {
          query.where('classes.subject', '=', subject)
        }
      })
      .join('teachers', 'classes.teacher_id', '=', 'teachers.id')
      .select(['classes.*', 'teachers.*'])

    return response.json(classes)
  }

  async create(request: Request, response: Response) {
    const { name, avatar, whatsapp, bio, subject, cost, schedule } = request.body
    const trx = await db.transaction()

    try {
      const insertedUser = await trx('teachers').insert({ name, avatar, whatsapp, bio })
      const insertedClass = await trx('classes').insert({ teacher_id: insertedUser[0], subject, cost })

      const classSchedule = schedule.map((scheduleItem: ScheduleProps) => {
        return {
          class_id: insertedClass[0],
          week_day: scheduleItem.weekDay,
          from: convertHoursToMinutes(scheduleItem.from),
          to: convertHoursToMinutes(scheduleItem.to),
        }
      })
      await trx('class_schedule').insert(classSchedule)

      await trx.commit()
      return response.status(201).send()
    } catch (err) {
      await trx.rollback()
      console.error(err)

      return unprocessableEntity(response)
    }
  }
}
