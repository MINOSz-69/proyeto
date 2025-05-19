const express = require('express');
const session = require('express-session');
const app = express();
const controlador = require('./controlador'); // Importar métodos del controlador

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesiones
app.use(session({
    secret: 'secreto_super_seguro',
    resave: false,
    saveUninitialized: true
}));

// Middleware para pasar usuario a todas las vistas
app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario;
    next();
});

// Ruta principal para mostrar el formulario de registro
app.get('/', (req, res) => {
    res.render('index');
});

// Ruta para guardar un usuario
app.post('/guardar', (req, res) => {
    const { nombre, correo, contra } = req.body;
    controlador.guardarUsuario(nombre, correo, contra, (err) => {
        if (err) {
            return res.status(500).send('Error al guardar el usuario: ' + err.message);
        }
        res.redirect('/login'); // Redirigir al formulario de inicio de sesión
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
        res.render('actualizar', { usuario });
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
        res.redirect('/usuarios');
    });
});

// Ruta para eliminar un usuario
app.post('/eliminar/:id', (req, res) => {
    const { id } = req.params;
    controlador.eliminarUsuario(id, (err, results) => {
        if (err) {
            return res.status(500).send('Error al eliminar el usuario');
        }
        res.redirect('/usuarios');
    });
});

// Ruta para consultar todos los usuarios y renderizar la vista
app.get('/usuarios', (req, res) => {
    controlador.consultarUsuarios((err, results) => {
        if (err) {
            return res.status(500).send('Error al consultar los usuarios');
        }
        res.render('usuarios', { usuarios: results });
    });
});

// Ruta para consultar un usuario por ID y mostrar sus resultados de test
app.get('/usuario', (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).send('Debe proporcionar un ID para buscar');
    controlador.consultarUsuarioPorId(id, (err, usuario) => {
        if (err) {
            return res.status(500).send('Error al consultar el usuario');
        }
        if (!usuario) {
            return res.status(404).send('Usuario no encontrado');
        }
        controlador.obtenerResultadosPorUsuario(id, (err2, resultados) => {
            if (err2) return res.status(500).send('Error al consultar los resultados');
            res.render('usuario', { usuario, resultados: resultados || [] });
        });
    });
});

// Ruta para mostrar pagina principal
app.get('/principal', (req, res) => {
    res.render('principal');
});

// Ruta para manejar el inicio de sesión
app.post('/login', (req, res) => {
    const { correo, contra } = req.body;
    // Acceso especial para admin
    if (correo === 'admin@gmail.com' && contra === 'admin1234') {
        req.session.usuario = { nombre: 'Administrador', correo: correo };
        return res.redirect('/usuarios');
    }
    controlador.iniciarSesion(correo, contra, (err, usuario) => {
        if (err) {
            if (err.message === 'Correo o contraseña incorrectos') {
                return res.status(401).send(err.message);
            }
            return res.status(500).send('Error al iniciar sesión');
        }
        req.session.usuario = usuario;
        res.redirect('/principal');
    });
});

// Ruta para mostrar el formulario de inicio de sesión
app.get('/login', (req, res) => {
    res.render('login');
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Ruta para mostrar la página de ayuda
app.get('/ayuda', (req, res) => {
    res.render('ayuda');
});

// Rutas para los tests (el usuario estará disponible en res.locals.usuario)
app.get('/test-ansiedad', (req, res) => {
    res.render('test-ansiedad');
});
app.get('/test-depresion', (req, res) => {
    res.render('test-depresion');
});
app.get('/test-estres', (req, res) => {
    res.render('test-estres');
});

// Ruta para guardar respuestas de un test (AJAX desde el frontend)
app.post('/guardar-test', (req, res) => {
    const { correo, tipo_test, respuestas, resultado, porcentaje } = req.body;
    controlador.buscarUsuarioPorCorreo(correo, (err, usuario) => {
        if (err || !usuario) {
            return res.status(400).send('Usuario no encontrado');
        }
        controlador.guardarRespuestasTest(usuario.id, tipo_test, respuestas, resultado, porcentaje, (err2) => {
            if (err2) return res.status(500).send('Error al guardar el test');
            res.send('Respuestas guardadas correctamente');
        });
    });
});

// Ruta para recibir comentarios de ayuda
app.post('/enviar-comentarios', (req, res) => {
    const { correo, comentarios } = req.body;
    // Aquí podrías guardar los comentarios en la base de datos o enviarlos por correo
    console.log(`Comentario recibido de ${correo}: ${comentarios}`);
    res.send('Gracias por tus comentarios. Nos pondremos en contacto contigo pronto.');
});

// Ruta para manejar errores 404
app.use((req, res) => {
    res.status(404).send('Página no encontrada');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});