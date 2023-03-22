import { PoolConfig } from "mysql";
import { PORT_DB, NAME_DATABASE_DB, PASSWORD_DB, USER_DB, HOST_DB, CONNECTIONLIMIT_DB } from "../config";

export const databasePool: PoolConfig = {
    connectionLimit: CONNECTIONLIMIT_DB,
    host: HOST_DB,
    user: USER_DB,
    password: PASSWORD_DB,
    database: NAME_DATABASE_DB,
    port: PORT_DB
}