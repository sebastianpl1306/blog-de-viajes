import {Router, Request, Response} from 'express'
import { pool } from '../DB/index';

const router: Router = Router();

router.get('/', (req: Request, res: Response) =>{
    pool.getConnection(function (err, connection) {
        const query = `SELECT * FROM tareas`;

        connection.query(query, (error, filas, campos) => {
            res.json({data: filas});
            res.status(200);
        })

        connection.release();
    })
})

export default router ;