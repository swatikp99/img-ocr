const express = require('express');
const app = express(); //initiate express
const fs = require("fs"); //for read and create files 
const multer = require('multer'); //uploads file to server
const {TesseractWorker} = require('tesseract.js')
const worker = new TesseractWorker();

// Storage
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, "./uploads");
    },
    filename: (req,file,cb) => {
        cb(null, file.originalname);
    }
}); //req - Request, res-Respond, cb-Call Back
// sets destination in ./uploads and filename as req.file
const upload = multer({storage: storage}).single("avatar");//1st storage is a variable, 2nd one is the above object that we are passing, "avatar" is the name of file
// when we will execute upload(any file) then it will check storage and run the code(line 7)

app.set("view engine","ejs"); // it helps us to write HTML and connect it to backend.
app.use(express.static("public")); //this gonna recognize the styles that we store in public 

// ROUTES
app.get('/',(req,res)=> {
    res.render('index');
}); // It renders the HTML page

// ROUTES after hitting submit
app.post('/upload', (req,res) => {
    upload(req,res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`,(err, data) => {
            if(err) return console.log('This is your error', err);

            /*main OCR code is here*/
            worker
            .recognize(data,"eng",{tessjs_create_pdf: '1'})
            .progress(progress => {
                console.log(progress)
            })
            .then(result => {
                //res.send(result.text);
                res.redirect('/download');
            })
            .finally(() => worker.terminator());
        });
    })
})

app.get('/download', (req,res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
});

/*app.get('/uploads',(req,res) => {
    console.log('hey')
});*/

//Start Up our server
const PORT = 5000 || process.env.POST; //5000 is for localhost and 2nd one is gonna recognize the port if uploaded to internet
app.listen(PORT, () => console.log(`Running on PORT${PORT}`));
