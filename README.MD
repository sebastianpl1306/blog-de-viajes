# Proyecto de node.js blog de viajes
***
Este es un proyecto desarrollado en el curso Web Back End, esta desarrollado usando NodeJs con apoyo de Express, este proyecto trata de un blog de viajes donde los usuarios podran registrarse y compartir los lugares que han visitado o los que les gustaria visitar, ademas de esto podran ver las publicaciones de otros usuarios y dar me gusta a las publicaciones que mas les gusten.

### ¿Que se debe tener para ejecutar el programa?
Se debe tener los siguientes programas en las versiones aca mencionadas.
* [MySql](https://downloads.mysql.com/archives/)
* [Node](https://nodejs.org/dist/v14.21.1/node-v14.21.1-x64.msi) V14.21.1
* npm 8.19.3

### ¿Como configurar el entorno?
Para poder configurar el entorno se deben seguir los siguientes pasos:
1. Realizar la restauración de la base de datos, esta teniendo en cuenta el archivo dump_blog_de_viajes.sql.
2. Agregar el archivo .env, este contendra las variables de entorno requeridas.
    * PORT=8080
    * CONNECTIONLIMIT_DB=20
    * HOST_DB=localhost
    * USER_DB=root
    * PASSWORD_DB=12345
    * NAME_DATABASE_DB=blog_de_viajes
    * PORT_DB=3306
3. Ejecutar el comando npm install
4. Ejecutar el comando npm run tsc -w
5. Ejecutar el comando npm run nodemon dist/index.js

### ¿Tienes el siguiente error "Client does not support authentication protocol requested by server; consider upgrading MySQL client"?

Primero aclaremos lo que está pasando:

MySQL 8 admite métodos de autenticación conectables. De forma predeterminada, se usa uno de ellos con nombre caching_sha2_passworden lugar de nuestro antiguo mysql_native_password.

Ahora, el problema está mysqljs en Node (el paquete con el que instala npm i mysqly lo usa en su código de Node) aún no es compatible con este nuevo método de autenticación

Se debe ejecutar los siguientes comandos:
1. *ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '12345'*
2. *flush privileges*