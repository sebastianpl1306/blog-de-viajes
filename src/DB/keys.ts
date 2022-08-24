import {
    CONNECTIONLIMIT_DB,
    HOST_DB,
    USER_DB,
    PASSWORD_DB,
    NAME_DATABASE_DB,
    PORT_DB
} from '../config'

export const databasePool = {
    connectionLimit: 20,
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'users_company',
    port: 3307
}