import { Router, Request, Response } from "express";
import { pool } from '../DB/index';
import admin from './admin';
import path from 'path';
import { enviarCorreoBienvenida } from '../helpers';

const router: Router = Router();

router.get('/', (req: Request, res: Response) =>{
    try{
       pool.getConnection((error, connection) =>{
            let consulta = "";
            let modificadorConsulta = "";
            let modificadorPagina = "";
            let pagina = 0;
            const busqueda = ( req.query.busqueda ) ? req.query.busqueda : "";
            if (busqueda != "") {
                modificadorConsulta = `
                    WHERE
                    titulo LIKE '%${busqueda}%' OR
                    resumen LIKE '%${busqueda}%' OR
                    contenido LIKE '%${busqueda}%'
                `;

                modificadorPagina = "";
            }else{
                if (typeof req.query.pagina === 'string' || typeof req.query.pagina === 'number') pagina = ( req.query.pagina ) ? parseInt(req.query.pagina) : 0;

                if (pagina < 0){
                    pagina = 0;
                }

                modificadorPagina = `
                    LIMIT 5 OFFSET ${pagina*5}
                `;
            }

            consulta = `
                SELECT 
                publicaciones.id, titulo, resumen, fecha_hora, pseudonimo, votos, avatar 
                FROM blog_de_viajes.publicaciones
                INNER JOIN autores ON publicaciones.autor_id = autores.id
                ${modificadorConsulta}
                ORDER BY fecha_hora DESC
                ${modificadorPagina};`;
            connection.query(consulta, (error, filas) =>{
                res.render("index", {publicaciones: filas, busqueda: busqueda, pagina: pagina});
            })

            connection.release();
        })
    }catch(error){
        res.json({errors: error})
    }
});

router.get('/registro', (request: Request, response: Response) =>{
    response.render('registro', {mensaje: request.flash('mensaje')});
});

router.post('/procesar_registro', (request: Request, response: Response) =>{
    pool.getConnection((error, connection) =>{
        const pseudonimo = request.body.pseudonimo.toLowerCase().trim();
        const email = request.body.email.trim();
        const contrasena = request.body.contrasena;
        const confirmar = request.body.confirmar;

        const consultaEmail = `
            SELECT * FROM autores
            WHERE email = ${connection.escape(email)}`;

        connection.query(consultaEmail, (error, filas) =>{
            if(filas.length > 0){
                request.flash('mensaje', 'Email duplicado');
                response.redirect('/registro');
            }else{
                const consultaPseudonimo = `
                SELECT * FROM autores
                WHERE pseudonimo = ${connection.escape(pseudonimo)}`;
                connection.query(consultaPseudonimo, (error, filas) =>{
                    if (filas.length > 0) {
                        request.flash('mensaje', 'pseudonimo duplicado');
                        response.redirect('/registro');
                    }else{
                        if (contrasena != confirmar) {
                            request.flash('mensaje', 'Las contraseñas no coinciden');
                            response.redirect('/registro');
                        }else{
                            const agregarRegistro = `
                                INSERT INTO autores
                                (email, contrasena, pseudonimo)
                                VALUES 
                                (${connection.escape(email)},
                                ${connection.escape(contrasena)},
                                ${connection.escape(pseudonimo)})`;

                            connection.query(agregarRegistro, (error, filas) =>{
                                if (request.files && request.files.avatar) {
                                    const archivoAvatar: any = request.files.avatar;
                                    const id = filas.insertId;
                                    const nombreArchivo = `${id}${path.extname(archivoAvatar.name)}`;
                                    archivoAvatar.mv(path.join(__dirname, `../../src/public/avatars/${nombreArchivo}`), () =>{
                                        const consultaAvatar = `
                                            UPDATE
                                            autores
                                            SET avatar = ${connection.escape(nombreArchivo)}
                                            WHERE id = ${connection.escape(id)}`;
                                        connection.query(consultaAvatar, (error, filas, campos) =>{
                                            enviarCorreoBienvenida(email, pseudonimo);
                                            request.flash('mensaje','Usuario registrado con avatar');
                                            response.redirect('/registro');
                                        })
                                    });
                                }else{
                                    enviarCorreoBienvenida(email, pseudonimo);
                                    request.flash('mensaje', 'Usuario registrado');
                                    response.redirect('/registro');
                                }
                            })
                        }
                    }
                })
            }
        })
        connection.release();
    })
});

router.get('/iniciar_sesion', (request: Request, response: Response) =>{
    response.render('iniciar_sesion', {mensaje: request.flash('mensaje')});
})
  
router.post('/procesar_iniciar_sesion', (request: Request, response: Response) =>{
    pool.getConnection((error, connection)=>{
        const email = request.body.email;
        const contrasena = request.body.contrasena;

        const consulta = `
            SELECT id, email, pseudonimo, avatar FROM
            autores
            WHERE
            email = ${connection.escape(email)} AND
            contrasena = ${connection.escape(contrasena)};`;
        
        connection.query(consulta, (error, filas) =>{
            if (filas.length > 0) {
                request.session.user = filas[0];
                response.redirect('/admin');
            }else{
                request.flash('mensaje', 'email o contraseña incorrectos');
                response.redirect('/iniciar_sesion');
            }
        })
    })
})

router.get('/publicacion/:id', (request: Request, response: Response) =>{
    try {
        pool.getConnection((error, connection) =>{
            const consulta = `
                SELECT publicaciones.id, titulo, resumen, contenido, votos, fecha_hora, pseudonimo FROM
                publicaciones
                INNER JOIN
                autores
                ON publicaciones.autor_id = autores.id
                WHERE publicaciones.id=${connection.escape(request.params.id)};`;
            connection.query(consulta, (error, filas)=>{
                if (filas.length > 0) {
                    const date = new Date(filas[0].fecha_hora)
                    const fecha = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
                    response.render('detalle_publicacion', {publicacion: filas[0], fecha: fecha});
                }else{
                    request.flash('mensaje', 'No se encontro la publicación')
                    response.redirect('/');
                }
            })
            connection.release();
        })
    } catch (error) {
        response.json({errors: error})
    }
})

router.get('/publicacion/:id/votar', (request: Request, response: Response) =>{
    try {
        pool.getConnection((error, connection) =>{
            const consulta = `
                SELECT * FROM
                publicaciones
                WHERE publicaciones.id=${connection.escape(request.params.id)};`;
            connection.query(consulta, (error, filas)=>{
                if (filas.length > 0) {
                    const consultaVoto = `
                        UPDATE publicaciones
                        SET
                        votos = votos + 1
                        WHERE id = ${connection.escape(request.params.id)}`;

                    connection.query(consultaVoto, (error, filas)=>{
                        response.redirect(`/publicacion/${request.params.id}`);
                    })
                }else{
                    request.flash('mensaje', 'Publicación inválida')
                    response.redirect('/');
                }
            })
            connection.release();
        })
    } catch (error) {
        response.json({errors: error})
    }
})

router.get('/autores', (request: Request, response: Response) =>{
    pool.getConnection((error, connection)=>{
        const consulta = `
            SELECT publicaciones.id, titulo, autor_id, pseudonimo, avatar, votos, resumen 
            FROM autores RIGHT JOIN publicaciones 
            ON publicaciones.autor_id = autores.id 
            ORDER BY 
            pseudonimo DESC, fecha_hora DESC;`;
        
        connection.query(consulta, (error, filas)=>{
            let actualAutor:string | null = null;
            const autores: any[] = [];
            filas.forEach((autor: any) => {
                if (autor.pseudonimo != actualAutor) {
                    actualAutor = autor.pseudonimo;
                    autores.push({
                        id: autor.autor_id,
                        pseudonimo: autor.pseudonimo,
                        avatar: autor.avatar,
                        publicaciones: []
                    });
                }
                autores[autores.length-1].publicaciones.push({
                    id: autor.id,
                    titulo: autor.titulo,
                    resumen: autor.resumen,
                    votos: autor.votos
                })
            });
            response.render('autores', {autores: autores});
        })
        
        connection.release();
    })
})

router.use('/admin', admin);

export { router };