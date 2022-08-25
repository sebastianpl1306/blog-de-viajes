import { Router, Request, Response } from "express";
import { pool } from '../DB/index';
import admin from './admin';

const router: Router = Router();

router.get('/', (req: Request, res: Response) =>{
    try{
       pool.getConnection((error, connection) =>{
            const query = `
                SELECT 
                publicaciones.id, titulo, resumen, fecha_hora, pseudonimo, votos, avatar 
                FROM blog_de_viajes.publicaciones
                INNER JOIN autores ON publicaciones.autor_id = autores.id
                ORDER BY fecha_hora DESC 
                LIMIT 5;`;

            connection.query(query, (error, filas) =>{
                res.render("index", {publicaciones: filas});
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
                                request.flash('mensaje', 'Usuario registrado');
                                response.redirect('/registro');
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

router.use('/admin', admin);

router.get('/cerrar_session', (request: Request, response: Response)=>{
    request.session.destroy((err) => {
        response.redirect('/');
    });
})

export { router };