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
// Método para guardar un nuevo registro en la base de datos
function guardarUsuario(nombre, correo, contraseña, callback) {
    const query = 'INSERT INTO usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)';
    const values = [nombre, correo, contraseña];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al guardar el usuario:', err);
            return callback(err);
        }
        console.log('Usuario guardado con éxito:', results);
        callback(null, results);
    });
}

// Exportar el método
module.exports = {
    guardarUsuario,
    // Otros métodos exportados...
};