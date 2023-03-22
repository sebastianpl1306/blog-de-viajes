import {Router, Request, Response, NextFunction} from 'express';
const router: Router = Router();

router.use((request: Request, response: Response, next: NextFunction) =>{
    if(!request.session.user){
        request.flash('mensaje', 'La session ha expirado');
        response.redirect('/iniciar_sesion');
        response.status(401);
    }else{
        next();
    }
})

export default router ;