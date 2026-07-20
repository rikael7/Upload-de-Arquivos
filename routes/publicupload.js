require('dotenv').config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const supabase = require("../config/supabase.js");


const router = express.Router();
// ==============


//supabase download
router.get('/arquivo/:nome', async (req, res) => {

    const nomeArquivo = req.params.nome;

    try {

        const { data, error } = await supabase
            .storage
            .from('upload')
            .download(nomeArquivo);


        if(error){
            return res.status(404).json({
                erro: "Arquivo não encontrado"
            });
        }


        const buffer = Buffer.from(
            await data.arrayBuffer()
        );


        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${nomeArquivo}"`
        );


        res.setHeader(
            'Content-Type',
            data.type || 'application/octet-stream'
        );


        res.send(buffer);


    } catch(err){

        console.error(err);

        res.status(500).json({
            erro:"Erro ao baixar arquivo"
        });

    }

});


// supabase listar arquivos
router.get('/arquivos/:pasta', async (req, res) => {

    const pasta = req.params.pasta;

    try {

        // Lista arquivos da pasta
        const { data: arquivos, error } = await supabase
            .storage
            .from('upload') // nome do bucket
            .list(pasta, {
                limit: 100,
                offset: 0,
                sortBy: {
                    column: 'name',
                    order: 'asc'
                }
            });


        if(error){
            return res.status(500).json({
                erro: error.message
            });
        }


        // Gera links temporários
        const arquivosComLinks = await Promise.all(
            arquivos.map(async (arquivo) => {

                const caminho = `${pasta}/${arquivo.name}`;

                const { data, error } = await supabase
                    .storage
                    .from('upload')
                    .createSignedUrl(
                        caminho,
                        60 * 10 // válido por 10 minutos
                    );


                return {
                    nome: arquivo.name,
                    tamanho: arquivo.metadata?.size,
                    tipo: arquivo.metadata?.mimetype,
                    criadoEm: arquivo.created_at,
                    atualizadoEm: arquivo.updated_at,
                    url: error ? null : data.signedUrl
                    
                }; 

            })
        );


        res.json(arquivosComLinks);


    } catch(err){

        console.error(err);

        res.status(500).json({
            erro: "Erro ao buscar arquivos"
        });

    }

});




//supabase upload zip
const compressedUpload = multer({

    storage: multer.memoryStorage(),

    limits: {
        fileSize: 100 * 1024 * 1024 // 100 MB
    },
    fileFilter: (req, file, cb) => {

        const extensoes = [
            ".zip",
            ".rar",
            ".md",
            ".txt",
            ".markdown",
            ".pdf",
            ".img",
            ".jpg",
            ".png",
            ".jpeg"
        ];
        if (extensoes.includes(
            path.extname(file.originalname).toLowerCase()
        )) {
            return cb(null, true);
        }
        cb(new Error("Apenas arquivos ZIP, RAR, PDF, JPEG, JPG, PNG"));
    }
});


router.post(
"/upload/zip", compressedUpload.single("arquivo"),
async (req, res) => {
    try {
        const agora = new Date();
        const nomeArquivo =
            `${agora.getFullYear()}-` +
            `${String(agora.getMonth()+1).padStart(2,'0')}-` +
            `${String(agora.getDate()).padStart(2,'0')}_` +
            `${String(agora.getHours()).padStart(2,'0')}-` +
            `${String(agora.getMinutes()).padStart(2,'0')}-` +
            `${String(agora.getSeconds()).padStart(2,'0')}_` +
            `${req.file.originalname}`;

        const { data, error } =
        await supabase.storage

        .from("upload")
        .upload(
            `zip/${nomeArquivo}`,
            req.file.buffer,
            {
                contentType: req.file.mimetype
            }
        );

        if(error){
            throw error;
        }

        const url =
        supabase.storage
        .from("zip")
        .getPublicUrl(data.path);

        res.json({
            sucesso: true,
            arquivo: nomeArquivo,
            url: url.data.publicUrl

        });

    } catch(err) {

        res.status(500).json({
            sucesso:false,
            erro:err.message
        });

    }
});



module.exports = router 