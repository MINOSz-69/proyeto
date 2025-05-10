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
// Ruta para consultar un usuario por ID
app.get('/usuario', (req, res) => {
    const { id } = req.query; // Obtener el ID del parámetro de consulta

    if (!id) {
        return res.status(400).send('Debe proporcionar un ID para buscar');
    }

    controlador.consultarUsuarioPorId(id, (err, usuario) => {
        if (err) {
            if (err.message === 'No se encontró un usuario con el ID proporcionado') {
                return res.status(404).send(err.message);
            }
            return res.status(500).send('Error al consultar el usuario');
        }
        res.render('usuario', { usuario }); // Renderizar la vista usuario.ejs con los datos del usuario
    });
});

// Ruta para mostrar el formulario de inicio de sesión
app.get('/login', (req, res) => {
    res.render('login'); // Renderizar la vista login.ejs
});

// Ruta para manejar el inicio de sesión
app.post('/login', (req, res) => {
    const { correo, contra } = req.body;

    controlador.iniciarSesion(correo, contra, (err, usuario) => {
        if (err) {
            if (err.message === 'Correo o contraseña incorrectos') {
                return res.status(401).send(err.message); // Credenciales incorrectas
            }
            return res.status(500).send('Error al iniciar sesión'); // Error general
        }
        res.send(`Bienvenido, ${usuario.nombre}`); // Respuesta de éxito
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});