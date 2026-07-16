require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { sanitizeBody } = require('./middleware/sanitize');
const { isAuthenticated } = require('../API/middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const publicupload = require('./routes/publicupload') // rota de upload publica
const protectedRoutes = require('./routes/protectedRoutes');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// servir public 
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Armazena as sessões no MySQL (tabela "sessions", criada automaticamente).
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Handler genérico de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

// Limita o tamanho do payload (evita payloads gigantes travando o servidor)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sanitiza todos os campos string do body contra XSS
app.use(sanitizeBody);


app.use(
  session({
    key: 'connect.sid',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // exige HTTPS em produção
      maxAge: 1000 * 60 * 60 * 24 // 1 dia
    }
  })
);


// FRONT END PRIVADO
app.get('/', isAuthenticated,  (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'inicial.html'));
});

app.get('/streaming', isAuthenticated,  (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'streaming.html'));
});

// FRONT END PÚBLICO
app.get('/login',  (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'upload.html'))
})

app.get('/register',  (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});
// ///////////




// ROTAS DE API
// PUBLICA
app.use('/auth', authRoutes); // rota para login, registro e logout (PUBLICA)
app.use('/api', publicupload);
// PRIVADAS
app.use('/api', protectedRoutes);
app.use('/api/profile', protectedRoutes); // rota para upload de avatar



app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});