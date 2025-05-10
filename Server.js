const express = require('express');
const app = express();
const controlador = require('./controlador'); // Importar métodos del controlador

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal para mostrar el formulario
app.get('/', (req, res) => {
    res.render('index', { message: 'Hello World!' }); // Renderizar una vista EJS
});

// Ruta para guardar un usuario
app.post('/guardar', (req, res) => {
    const { nombre, correo, contra } = req.body; // Obtener datos del cuerpo de la solicitud

    controlador.guardarUsuario(nombre, correo, contra, (err, results) => {
        if (err) {
            if (err.message === 'El nombre o el correo ya están registrados') {
                return res.status(400).send(err.message); // Enviar mensaje de error si hay duplicados
            }
            return res.status(500).send('Error al guardar el usuario'); // Error general
        }
        res.send('Usuario guardado con éxito'); // Confirmación de éxito
    });
});

// Ruta para mostrar el formulario de actualización
app.get('/actualizar/:id', (req, res) => {
    const { id } = req.params;

    controlador.consultarUsuarioPorId(id, (err, usuario) => {
        if (err) {
            return res.status(500).send('Error al consultar el usuario');
        }
        if (!usuario) {
            return res.status(404).send('Usuario no encontrado');
        }
        res.render('actualizar', { usuario }); // Renderizar la vista actualizar.ejs con los datos del usuario
    });
});

// Ruta para procesar la actualización de un usuario
app.post('/actualizar/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, correo } = req.body;

    controlador.actualizarUsuario(id, nombre, correo, (err, results) => {
        if (err) {
            return res.status(500).send('Error al actualizar el usuario');
        }
        res.redirect('/usuarios'); // Redirigir a la lista de usuarios
    });
});

// Ruta para eliminar un usuario
app.post('/eliminar/:id', (req, res) => {
    const { id } = req.params;

    controlador.eliminarUsuario(id, (err, results) => {
        if (err) {
            return res.status(500).send('Error al eliminar el usuario');
        }
        res.redirect('/usuarios'); // Redirigir a la lista de usuarios
    });
});

// Ruta para consultar todos los usuarios y renderizar la vista
app.get('/usuarios', (req, res) => {
    controlador.consultarUsuarios((err, results) => {
        if (err) {
            return res.status(500).send('Error al consultar los usuarios');
        }
        res.render('usuarios', { usuarios: results }); // Renderizar la vista usuarios.ejs con los datos
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});