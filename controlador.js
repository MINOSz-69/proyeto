const mysql = require('mysql2');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
    host: 'sql5.freesqldatabase.com', // Cambia esto por la dirección de tu servidor de base de datos
    user: 'sql5778913',      // Cambia esto por tu usuario de base de datos
    password: 'fnycduQda2',      // Cambia esto por tu contraseña de base de datos
    database: 'sql5778913' // Cambia esto por el nombre de tu base de datos
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

// Método para eliminar un usuario de la base de datos
function eliminarUsuario(id, callback) {
    const query = 'DELETE FROM usuarios WHERE id = ?';
    const values = [id];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al eliminar el usuario:', err);
            return callback(err);
        }
        if (results.affectedRows === 0) {
            return callback(new Error('No se encontró un usuario con el ID proporcionado'));
        }
        console.log('Usuario eliminado con éxito:', results);
        callback(null, results);
    });
}

// Método para consultar todos los usuarios de la base de datos
function consultarUsuarios(callback) {
    const query = 'SELECT * FROM usuarios';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al consultar los usuarios:', err);
            return callback(err);
        }
        console.log('Usuarios consultados con éxito:', results);
        callback(null, results);
    });
}
// Método para consultar un usuario por ID
function consultarUsuarioPorId(id, callback) {
    const query = 'SELECT * FROM usuarios WHERE id = ?';
    const values = [id];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al consultar el usuario:', err);
            return callback(err);
        }
        callback(null, results[0]); // Retornar el primer usuario encontrado
    });
}

// Método para actualizar un usuario
function actualizarUsuario(id, nombre, correo, callback) {
    const query = 'UPDATE usuarios SET nombre = ?, correo = ? WHERE id = ?';
    const values = [nombre, correo, id];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al actualizar el usuario:', err);
            return callback(err);
        }
        callback(null, results);
    });
}

// Método para buscar un usuario por ID
function buscarUsuarioPorId(id, callback) {
    const query = 'SELECT * FROM usuarios WHERE id = ?';
    const values = [id];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al buscar el usuario:', err);
            return callback(err);
        }
        if (results.length === 0) {
            return callback(new Error('No se encontró un usuario con el ID proporcionado'));
        }
        console.log('Usuario encontrado:', results[0]);
        callback(null, results[0]); // Retornar el primer usuario encontrado
    });
}
// Método para manejar el inicio de sesión
function iniciarSesion(correo, contra, callback) {
    const query = 'SELECT * FROM usuarios WHERE correo = ? AND contra = ?';
    const values = [correo, contra];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al iniciar sesión:', err);
            return callback(err);
        }
        if (results.length === 0) {
            return callback(new Error('Correo o contraseña incorrectos'));
        }
        console.log('Inicio de sesión exitoso:', results[0]);
        callback(null, results[0]); // Retornar el usuario encontrado
    });
}

// Exportar el método
module.exports = {
    guardarUsuario,
    verificarDuplicados,
    eliminarUsuario,
    consultarUsuarios,
    consultarUsuarioPorId,
    actualizarUsuario,
    buscarUsuarioPorId,
    iniciarSesion, // Nuevo método exportado
    // Otros métodos exportados...
};