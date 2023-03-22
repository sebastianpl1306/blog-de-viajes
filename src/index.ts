import { config } from "dotenv";
config();

//funciones y variables locales
import { PORT } from './config';
import { router } from './router/index'
import { Server } from './server'
import { initConnectionDB } from './DB/index';

//Permite inicializar todos los componentes y paquetes del servidor
const server = Server.instance();
server.initiateAndStart(
    Number(PORT), initConnectionDB
).catch((error) => console.log("[INITIAL][ERROR]", error));

const appServer = server.app;

appServer.use('/', router);