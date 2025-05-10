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
// Método para verificar si el nombre o correo ya existen
function verificarDuplicados(nombre, correo, callback) {
    const query = 'SELECT * FROM usuarios WHERE nombre = ? OR correo = ?';
    const values = [nombre, correo];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al verificar duplicados:', err);
            return callback(err);
        }
        if (results.length > 0) {
            return callback(null, true); // Hay duplicados
        }
        callback(null, false); // No hay duplicados
    });
}

// Método para guardar un nuevo registro en la base de datos
function guardarUsuario(nombre, correo, contra, callback) {
    verificarDuplicados(nombre, correo, (err, duplicado) => {
        if (err) {
            return callback(err);
        }
        if (duplicado) {
            return callback(new Error('El nombre o el correo ya están registrados'));
        }

        const query = 'INSERT INTO usuarios (nombre, correo, contra) VALUES (?, ?, ?)';
        const values = [nombre, correo, contra];

        connection.query(query, values, (err, results) => {
            if (err) {
                console.error('Error al guardar el usuario:', err);
                return callback(err);
            }
            console.log('Usuario guardado con éxito:', results);
            callback(null, results);
        });
    });
}

// Exportar los métodos
module.exports = {
    guardarUsuario,
    verificarDuplicados,
    // Otros métodos exportados...
};