import { Publicaciones } from './publicaciones';

export interface Autores{
    id: number;
    email?: string;
    pseudonimo?: string;
    avatar?: string;
    publicaciones: Publicaciones[];
}