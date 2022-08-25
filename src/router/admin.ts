import {Router, Request, Response, NextFunction} from 'express';
import { pool } from '../DB/index';

const router: Router = Router();

router.use((request: Request, response: Response, next: NextFunction) =>{
    if(!request.session.user){
        request.flash('mensaje', 'La session ha expirado');
        response.redirect('/iniciar_sesion')
    }else{
        next();
    }
})

router.get('/', (req: Request, res: Response) =>{
    res.render('admin/index', {session: req.session.user});
})

export default router ;