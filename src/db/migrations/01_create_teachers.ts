import Knex from 'knex'

export interface TeacherProps {
  id: number
  name: string
  avatar: string
  whatsapp: string
  bio: string
}

export async function up(knex: Knex) {
  return knex.schema.createTable('teachers', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.string('avatar').notNullable()
    table.string('whatsapp').notNullable()
    table.string('bio')
  })
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('users')
}
