// Middleware que protege rotas exigindo uma sessão autenticada.
// Assume que req.session.userId foi definido no login.

const db = require('../config/db'); // pool de conexão para verificar se o user possui flag de admin no db


//verificar se tem permissão de admin
async function admin(req, res, next) {
    try {
        const userId = req.session.user.id;
        const [rows] = await db.query(
            'SELECT adm FROM usuarios WHERE id = ? LIMIT 1',
            [userId]
        );
        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Usuário não encontrado.'
            });
        }
        if (!rows[0].adm) {
            return res.status(403).json({
                message: 'Acesso negado, você não é administrador.'
            });
        }
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Erro interno do servidor.'
        });
    }
}


// Middleware que protege rotas exigindo uma sessão autenticada.
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'Não autenticado. Faça login para continuar.' });
}

module.exports = { isAuthenticated, admin };