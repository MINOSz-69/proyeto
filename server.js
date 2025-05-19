const express = require('express');
const app = express();
const controlador = require('./controlador'); // Importar métodos del controlador

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para usuario SIN cookies ni ningún otro paquete externo
app.use((req, res, next) => {
    res.locals.usuario = null;
    if (req.body && req.body.usuario) {
        try {
            res.locals.usuario = JSON.parse(req.body.usuario);
        } catch {
            res.locals.usuario = null;
        }
    } else if (req.query && req.query.usuario) {
        try {
            res.locals.usuario = JSON.parse(req.query.usuario);
        } catch {
            res.locals.usuario = null;
        }
    }
    next();
});

// Ruta principal para mostrar el formulario de registro
app.get('/', (req, res) => {
    res.render('index');
});

// Ruta para mostrar el formulario de inicio de sesión
app.get('/login', (req, res) => {
    res.render('login');
});

// Ruta para cerrar sesión (solo redirige)
app.get('/logout', (req, res) => {
    res.redirect('/login');
});

// Registro de usuario (con validación)
app.post('/guardar', (req, res) => {
    const { nombre, correo, contra } = req.body;
    if (!nombre || !correo || !contra) {
        return res.status(400).send('<script>alert("Todos los campos son obligatorios."); window.history.back();</script>');
    }
    controlador.guardarUsuario(nombre, correo, contra, (err) => {
        if (err) {
            return res.status(400).send(`<script>alert("${err.message}"); window.history.back();</script>`);
        }
        res.redirect('/login');
    });
});

// Login de usuario (con validación)
app.post('/login', (req, res) => {
    const { correo, contra } = req.body;
    // Acceso especial para admin
    if (correo === 'admin@gmail.com' && contra === 'admin1234') {
        const usuario = encodeURIComponent(JSON.stringify({ nombre: 'Administrador', correo: correo }));
        return res.redirect('/usuarios?usuario=' + usuario);
    }
    if (!correo || !contra) {
        return res.status(400).send('<script>alert("Correo y contraseña son obligatorios."); window.history.back();</script>');
    }
    controlador.iniciarSesion(correo, contra, (err, usuario) => {
        if (err) {
            return res.status(400).send(`<script>alert("${err.message}"); window.history.back();</script>`);
        }
        res.redirect(`/principal?usuario=${encodeURIComponent(JSON.stringify(usuario))}`);
    });
});

// Rutas protegidas: requieren usuario en query o body
app.get('/principal', (req, res) => {
    if (!res.locals.usuario) return res.redirect('/usuarios');
    res.render('principal', { usuario: res.locals.usuario });
});

// Mostrar todos los usuarios (solo admin)
app.get('/usuarios', (req, res) => {
    if (!res.locals.usuario) return res.redirect('/usuarios');
    controlador.obtenerUsuarios((err, usuarios) => {
        if (err) {
            return res.status(500).send('Error al obtener usuarios');
        }
        res.render('usuarios', { usuarios, usuario: res.locals.usuario });
    });
});

// Buscar usuario por ID (para formulario de búsqueda)
app.get('/usuario', (req, res) => {
    // El usuario debe venir en el query string como usuario
    if (!res.locals.usuario) return res.redirect('/login');
    const id = req.query.id;
    controlador.consultarUsuarioPorId(id, (err, usuarioBuscado) => {
        if (err || !usuarioBuscado) {
            // Si no se encuentra, regresa a la lista de usuarios manteniendo la sesión
            return res.status(404).send('<script>alert("Usuario no encontrado."); window.location.href="/usuarios?usuario=' + encodeURIComponent(JSON.stringify(res.locals.usuario)) + '";</script>');
        }
        // Muestra la tabla con el usuario encontrado y mantiene la sesión
        res.render('usuarios', { usuarios: [usuarioBuscado], usuario: res.locals.usuario });
    });
});
// Mostrar formulario de actualización de usuario
app.get('/actualizar/:id', (req, res) => {
    if (!res.locals.usuario) return res.redirect('/login'); // Corregido: redirige a login si no hay usuario
    const id = req.params.id;
    controlador.consultarUsuarioPorId(id, (err, usuario) => {
        if (err || !usuario) {
            return res.status(404).send('Usuario no encontrado');
        }
        res.render('actualizar', { usuario });
    });
});
// Mostrar página de ayuda
app.get('/ayuda', (req, res) => {
    res.render('ayuda', { usuario: res.locals.usuario });
});

// Mostrar tests
app.get('/test-depresion', (req, res) => {
    if (!res.locals.usuario) return res.redirect('/principal');
    res.render('test-depresion', { usuario: res.locals.usuario });
});
app.get('/test-ansiedad', (req, res) => {
    if (!res.locals.usuario) return res.redirect('/principal');
    res.render('test-ansiedad', { usuario: res.locals.usuario });
});
app.get('/test-estres', (req, res) => {
    if (!res.locals.usuario) return res.redirect('/principal');
    res.render('test-estres', { usuario: res.locals.usuario });
});

// Guardar respuestas de test (ejemplo para depresión)
app.post('/test-depresion', (req, res) => {
    if (!res.locals.usuario) return res.redirect('/principal');
    const respuestas = req.body.respuestas || req.body;
    const resultado = 'Leve'; // Ejemplo, reemplaza con tu lógica
    const porcentaje = 50;    // Ejemplo, reemplaza con tu lógica

    controlador.guardarRespuestasTest(
        res.locals.usuario.id,
        'depresion',
        respuestas,
        resultado,
        porcentaje,
        (err) => {
            if (err) return res.status(500).send('Error al guardar el test');
            const usuarioStr = encodeURIComponent(JSON.stringify(res.locals.usuario));
            res.redirect('/resultados?usuario=' + usuarioStr);
        }
    );
});

// Mostrar historial de resultados del usuario
app.get('/resultados', (req, res) => {
    if (!res.locals.usuario) return res.redirect('/usuarios');
    controlador.obtenerResultadosPorUsuario(res.locals.usuario.id, (err, resultados) => {
        if (err) return res.status(500).send('Error al obtener resultados');
        res.render('resultados', { resultados, usuario: res.locals.usuario });
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
