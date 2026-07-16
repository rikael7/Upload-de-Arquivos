const pool = require('../config/db');


// CONTROLLER ADMIN
// Controller upload de video do admin
async function uploadVideo(req, res) {

    try {

        const {
            titulo,
            descricao
        } = req.body;

        // Verifica se recebeu arquivo
        if (!req.file) {
            return res.status(400).json({
                message: 'Nenhum vídeo enviado.'
            });
        }

        const video = {
            titulo,
            descricao,
            nome_arquivo: req.file.filename,
            tipo_arquivo: req.file.mimetype,
            tamanho: req.file.size,
            usuario_id: req.session.user.id
        };


        await pool.query(
            `
            INSERT INTO videos
            (
                titulo,
                descricao,
                nome_arquivo,
                tipo_arquivo,
                tamanho,
                usuario_id
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                video.titulo,
                video.descricao,
                video.nome_arquivo,
                video.tipo_arquivo,
                video.tamanho,
                video.usuario_id
            ]
        );


        return res.status(201).json({
            message: 'Vídeo enviado com sucesso.'
        });


    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: 'Erro ao salvar vídeo.'
        });

    }

};




// CONTROLLER DE AUTENTICAÇÃO
//controler 
async function findUserByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
}
// finduserbyname
async function finduserbyname(name) {
  const [rows] = await pool.query(
    'SELECT id, name, email, password_hash FROM users WHERE name = ? LIMIT 1',
    [name]
  );
  return rows[0] || null;
}



// CONTROLLERS DO USER
// controller para ler info do usuario pelo id 
async function findUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, bio, phone, avatar_url, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}
// controller para criar usuario
async function createUser({ name, email, passwordHash }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash]
  );
  return { id: result.insertId, name, email };
}
// controller para atualizar o perfil do usuário
async function updateUserProfile(id, { name, bio, phone, avatarUrl }) {
  await pool.query(
    `UPDATE users
     SET name = ?, bio = ?, phone = ?, avatar_url = ?
     WHERE id = ?`,
    [name, bio, phone, avatarUrl, id]
  );
  return findUserById(id);
}




module.exports = { finduserbyname, findUserByEmail, findUserById, createUser, uploadVideo };