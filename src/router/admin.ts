import {Router, Request, Response, query} from 'express';
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

            connection.release();
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

router.get('/editar_publicacion/:id', (request: Request, response: Response)=>{
    try {
        pool.getConnection((error, connection)=>{
            const consultaPublicacion = `
                SELECT * FROM
                publicaciones
                WHERE 
                autor_id = ${connection.escape(request.session.user?.id)} AND
                id = ${connection.escape(request.params.id)};`;
            
            connection.query(consultaPublicacion, (error, filas) =>{
                if (filas.length > 0) {
                    response.render('admin/form_editar_publicacion', {session: request.session.user, publicacion: filas[0]});
                }else{
                    request.flash('mensaje', 'Operación no valida');
                    response.redirect('/admin');
                }
            });

            connection.release();
        })
        
    } catch (error) {
        response.json({errors: error})
    }
})

router.post('/procesar_editar_publicacion/:id', (request: Request, response: Response)=>{
    try {
        pool.getConnection((error, connection)=>{
            const consultaPublicacion = `
                SELECT * FROM
                publicaciones
                WHERE
                autor_id = ${connection.escape(request.session.user?.id)} AND
                id = ${connection.escape(request.params.id)};`;
            
            connection.query(consultaPublicacion, (error, filas) =>{
                if (filas.length > 0) {
                    const titulo = request.body.titulo;
                    const contenido = request.body.contenido;
                    const resumen = request.body.resumen;
                    const date = new Date()
                    const fecha = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
                    const editarPublicacion = `
                        UPDATE publicaciones
                        SET
                        titulo = ${connection.escape(titulo)},
                        contenido = ${connection.escape(contenido)},
                        resumen = ${connection.escape(resumen)},
                        fecha_hora = ${connection.escape(fecha)}
                        WHERE id = ${connection.escape(request.params.id)};`;
                    console.log(editarPublicacion);
                    connection.query(editarPublicacion, (error, filas) =>{
                        request.flash('mensaje', 'Publicación editada');
                        response.redirect("/admin");
                    })
                }else{
                    request.flash('mensaje', 'Operación no valida');
                    response.redirect('/admin');
                }
            });
            connection.release();
        })
    } catch (error) {
        response.json({errors: error})
    }
})

router.get('/procesar_eliminar_publicacion/:id', (request: Request, response: Response)=>{
    try {
        pool.getConnection((error, connection)=>{
            const consultaPublicacion = `
                SELECT * FROM
                publicaciones
                WHERE
                autor_id = ${connection.escape(request.session.user?.id)} AND
                id = ${connection.escape(request.params.id)};`;
            
            connection.query(consultaPublicacion, (error, filas) =>{
                if (filas.length > 0) {
                    const eliminarPublicacion = `
                        DELETE FROM publicaciones
                        WHERE id = ${connection.escape(request.params.id)};`;
                    connection.query(eliminarPublicacion, (error, filas) =>{
                        request.flash('mensaje', 'Publicación eliminada');
                        response.redirect("/admin");
                    })
                }else{
                    request.flash('mensaje', 'Operación no valida');
                    response.redirect('/admin');
                }
            });
            connection.release();
        })
    } catch (error) {
        response.json({errors: error})
    }
})

router.get('/cerrar_session', (request: Request, response: Response)=>{
    request.session.destroy((err) => {
        response.redirect('/');
    });
})

export default router ;