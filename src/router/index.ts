import { Router, Request, Response } from "express";
import home from './home'

const router: Router = Router();

const PATH_ROUTES = __dirname;

console.log(PATH_ROUTES);

router.get('/', (req: Request, res: Response) =>{
    res.render("index", {nombre: req.body.nombre});
});

router.use('/home', home);
  
export { router };