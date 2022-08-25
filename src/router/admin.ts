import {Router, Request, Response} from 'express';
import { pool } from '../DB/index';
import verifyLogin from './middlewares';

const router: Router = Router();

router.use(verifyLogin);

router.get('/', (req: Request, res: Response) =>{
    try {
        pool.getConnection((error, connection) => {
            const consulta = `
                SELECT * FROM publicaciones
                WHERE autor_id = ${connection.escape(req.session.user?.id)}`;
            connection.query(consulta, (error, filas) =>{
                res.render('admin/index', {session: req.session.user, mensaje: req.flash('mensaje'), publicaciones: filas});
            })
        })
    } catch (error) {
        res.json({errors: error});
    }
    
})

router.get('/agregar_publicacion', (request: Request, response:Response) =>{
    response.render('admin/form_agregar_publicacion', {session: request.session.user});
})

router.post('/procesar_agregar_publicacion', (request: Request, response:Response) =>{
    pool.getConnection(function (err, connection) {
        const date = new Date()
        const fecha = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
        const consulta = `
            INSERT INTO
            publicaciones
            (titulo, resumen, contenido, autor_id, fecha_hora)
            VALUES
            (
                ${connection.escape(request.body.titulo)},
                ${connection.escape(request.body.resumen)},
                ${connection.escape(request.body.contenido)},
                ${connection.escape(request.session.user?.id)},
                ${connection.escape(fecha)}
            )`;
        
        connection.query(consulta, function (error, filas, campos) {
            request.flash('mensaje', 'Publicación agregada');
            response.redirect("/admin");
        });

        connection.release();
    })
})

router.get('/cerrar_session', (request: Request, response: Response)=>{
    request.session.destroy((err) => {
        response.redirect('/');
    });
})

export default router ;