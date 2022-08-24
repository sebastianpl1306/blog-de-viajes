import { databasePool } from './index'
import { createPool, Pool } from 'mysql';

export let pool: Pool;

//Conectando a base de datos
export const initConnectionDB = () => {
    try {
      pool = createPool(databasePool);
  
      console.debug('MySql Adapter Pool generated successfully');
    } catch (error) {
      console.error('[mysql.connector][init][Error]: ', error);
      throw new Error('failed to initialized pool');
    }
};
