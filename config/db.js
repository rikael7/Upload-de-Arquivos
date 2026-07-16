const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool de conexões reutilizável em toda a aplicação
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testa a conexão assim que o pool é criado, só para debug.
// Pega uma conexão emprestada, confirma que funciona e devolve ao pool.
(async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL conectado com sucesso em ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME}`);
    connection.release();
  } catch (err) {
    console.error('❌ Falha ao conectar no MySQL:', err.message);
  }
})();

module.exports = pool;