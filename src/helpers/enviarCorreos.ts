import nodemailer from 'nodemailer';

/*
* Para poder conectarse con google es necesario realizar la activación de Acceso de aplicaciones menos seguras
* de la cuenta de google.
*/
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'correo@gmail.com',
        pass: 'contraseña-correo'
    }
})

export function enviarCorreoBienvenida(email: string, nombre: string) {
    const opciones = {
        from: 'correo@gmail.com',
        to: email,
        subject: 'Bienvenido al blog de viajes',
        text: `Hola ${nombre}`
    }
    transporter.sendMail(opciones, (error, info)=>{
        if (error) {
            console.log("[ERROR] enviarCorreoBienvenida error:",error);
        }
    });
}