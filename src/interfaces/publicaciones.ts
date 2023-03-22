export interface Publicaciones{
    id: number;
    titulo?: string;
    resumen?: string;
    contenido?: string;
    autor?: number;
    foto?: string;
    votos?: number;
    fecha_hora?: Date;
}