const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

app.use('/compressed_images', express.static('compressed_images'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('home',{a:null});
});

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: function (req, file, cb) {
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniquePrefix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

app.post('/', upload.single('uploaded_file'), async function (req, res) {
    let filePath = req.file.path;
    console.log(filePath);

    try {
        // Dynamically import imagemin and imagemin-mozjpeg
        const imagemin = await import('imagemin');
        const imageminMozjpeg = (await import('imagemin-mozjpeg')).default;
        const imageminPngquant = (await import('imagemin-pngquant')).default;

        const files = await imagemin.default([filePath], {
            destination: 'compressed_images',
            plugins: [imageminMozjpeg({ quality: 50 }),
                imageminPngquant({
                    quality: [0.6, 0.8]
                })
            ]
        });

        console.log('Compressed files:', files);

        const filepath1 = files[0].destinationPath;
        res.render('home',{a: filepath1})
    } catch (error) {
        console.error('Error during image compression:', error);
    }

    res.render('home');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})