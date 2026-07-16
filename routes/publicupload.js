const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();


// upload markdown
const markdownStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/mk");
    },
    filename: (req, file, cb) => {
        const nome = Date.now() + "-" + file.originalname;
        cb(null, name);
    }
});

const markdownUpload = multer({
    storage: markdownStorage,
    fileFilter: (req, file, cb) => {

        const extensoes = [".md", ".markdown"];

        if (extensoes.includes(path.extname(file.originalname).toLowerCase())) {
            return cb(null, true);
        }

        cb(new Error("Apenas arquivos Markdown."));
    }
});

router.post(
    "/upload/mk",
    markdownUpload.single("arquivo"),
    (req, res) => {

        res.json({
            sucesso: true,
            arquivo: req.file.filename
        });

    }
);
// ==============


//  Upload
const compressedStorage = multer.diskStorage({
    

    destination: (req, file, cb) => {
        cb(null, "./uploads/zip");
    },
    filename: (req, file, cb) => {

        const agora = new Date();

      const nome =
        `${agora.getFullYear()}-` +
        `${String(agora.getMonth()+1).padStart(2,'0')}-` +
        `${String(agora.getDate()).padStart(2,'0')}_` +
        `${String(agora.getHours()).padStart(2,'0')}-` +
        `${String(agora.getMinutes()).padStart(2,'0')}-` +
        `${String(agora.getSeconds()).padStart(2,'0')}_` +
        `${file.originalname}`;
      cb(null, nome);
    }
});

const compressedUpload = multer({
    storage: compressedStorage,

       limits: {
        fileSize: 100 * 1024 * 1024 // 100 MB
    },

    fileFilter: (req, file, cb) => {

        const extensoes = [
            ".zip",
            ".rar"
        ];

        if (extensoes.includes(path.extname(file.originalname).toLowerCase())) {
            return cb(null, true);
        }

        cb(new Error("Apenas arquivos ZIP ou RAR."));
    }
});

router.post("/upload/zip", (req, res) => {

    compressedUpload.single("arquivo")(req, res, function(err){

        if(err){

            if(err.code === "LIMIT_FILE_SIZE"){
                return res.status(400).json({
                    sucesso: false,
                    erro: "O arquivo excede o tamanho máximo permitido de 100 MB."
                });
            }

            return res.status(400).json({
                sucesso: false,
                erro: err.message
            });

        }


        res.json({
            sucesso: true,
            arquivo: req.file.filename
        });

    }) //
});


module.exports = router 