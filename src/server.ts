import { Application } from "express";
import session from 'express-session';
import flash from 'express-flash'
import express from "express";
import logger from 'morgan';

export class Server {
    private _app: Application;
    private _serverPort: number | null;
    private _started: boolean;
    private _initiated: boolean;

    public get app(): Application {
        return this._app
    }

    public get serverPort(): number | null {
        return this._serverPort
    }

    public get started(): boolean {
        return this._started
    }

    public get initiated(): boolean {
        return this._initiated
    }

    private static _instance: Server;

    public static instance(): Server {
        return this._instance || (this._instance = new this())
    }

    private constructor() {
        this._serverPort = null;
        this._app = express();
        this._started = false;
        this._initiated = false;
    }

    public async initiateAndStart(serverPort: number, connection: () => void
    ): Promise<any> {
        await this.initiate(serverPort, connection);
        await this.start();
    }

    public async initiate(serverPort: number, connection: () => void
    ): Promise<any> {
        if(!this.initiated) {
            this._serverPort = serverPort;
            this.defaultConfigurations();
            connection();
            this._initiated = true;
        } else {
            return Promise.reject("SERVER ALREADY INITIATED")
        }
    }

    public async start(): Promise<any> {
        if(!this.started) {
            await new Promise((resolve, reject) => {
                if(this._app) {
                    this._app.listen(this._serverPort, () => {
                        console.log(`[SERVER][INFO] SERVER RUNNING ON ${this._serverPort}`);
                        this._started = true;
                    })
                } else {
                    reject("No https server to start")
                }
            })
        } else {
            return Promise.reject("SERVER ALREADY STARTED")
        }
    }

    private defaultConfigurations(): void {
        if(this.app) {
            this.app.set('view engine', 'ejs');
            this.app.use(logger('dev'))
            this.app.use(express.json({ limit: '100mb' }));
            this.app.use(express.urlencoded({ limit: '100mb', extended: true }));
            this.app.use(session({ secret: 'token-muy-secreto', resave: true, saveUninitialized: true }));
            this.app.use(flash());
        } else {
            throw new Error("The express app must be initiated you must start the server first")
        }
    }
}