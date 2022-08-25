import session,{ SessionData } from 'express-session';

export interface ISession{
  id: number;
  email: string;
  pseudonimo: string;
  avatar?: string;
}

declare module "express-session" {
  interface SessionData{
      user: ISession
  }
}