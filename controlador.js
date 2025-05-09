const mysql = require('mysql2');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost', // Cambia esto por la dirección de tu servidor de base de datos
    user: 'root',      // Cambia esto por tu usuario de base de datos
    password: '',      // Cambia esto por tu contraseña de base de datos
    database: 'cecypcicos' // Cambia esto por el nombre de tu base de datos
});

// Establecer la conexión
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
});

// Exportar la conexión para usarla en otros archivos
module.exports = connection;