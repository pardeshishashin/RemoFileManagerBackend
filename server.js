const express = require('express');
const bodyParser = require('body-parser');
const multer = require("multer");
const mongoose = require('mongoose');
const remofile = require('./models/remofile');
const path = require("path");
const app = express();

const port = 3000

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg' : 'jpg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({

  destination: (req,file,cb) =>{
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if(isValid){
      error = null;
    }  
    cb(error, "backend/images");
  },
  filename:(rq,file,cb) => {
    
    const name = file.originalname
    .toLowerCase().split(' ').join('-');
    const  ext = MIME_TYPE_MAP[file.mimetype];
    cb(null,name + '-' + Date.now() + '.' +
     ext );
  }
});  

app.get('/', (req, res) => {
  res.send('Welcome Remo File Manager')
});

mongoose.connect('mongodb+srv://Shashin:jGRxV9sHhO0zrgBl@cluster0-vumni.mongodb.net/remofile',{useNewUrlParser: true,useUnifiedTopology: true})
.then(()=>{
  console.log("Connected to Database...");

})
.catch(()=>{
  console.log("connection Fail...");

})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images",express.static(path.join("backend/images")));
app.use((req,res,next) =>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,PATCH,DELETE,OPTIONS");
    next();
});

app.post("/createFolder", (req,res,next) => {
   const folderName = req.body.folder;

  const data = new remofile({
      folderName: folderName,
      subFolder: [],
      files: [],
      parent: req.body.parent
  });
  data.save().then(data => {
    
    remofile.updateOne({ _id : req.body.id},
      { $push: { subFolder: [data._id] } }
     ).then(data =>{
      //  console.log("success");
     })
  })

});
app.put("/updateFolder/:data", multer({ storage: storage }).single("image"), (req,res,next) => {
  const url = req.protocol + "://" + req.get("host");
  imagePath = url + "/images/" + req.file.filename;
  remofile.updateOne({_id: req.params.id},
    { 
            $set: {
            files: imagePath
          }    
    }) 
    .then(()=>{
        res.send('success');
    })
    .catch((err)=>{ 
        console.log(err);
        
    });
    
 
});

app.get("/show/:id", (req,res,next) => {
  // console.log(req.params.data);
  remofile.findOne({_id: req.params.id}).then((result) =>{
    console.log(result);
    res.send(result);
});

});

app.get("/subFolder/:id", (req,res,next) => {
  // console.log(req.params.id);
  let sub_folder_id;
  remofile.findOne({_id: req.params.id}).then((result) =>{
    sub_folder_id = result.subFolder;
    
    remofile.find({ _id: { $in: sub_folder_id } } ).then((data) =>{
      res.send(data)
    });

});

});
app.get("/showFolder", (req,res,next) => {
  // console.log(req.params.data);
  remofile.find({parent: null}).then((result) =>{
     console.log(result);
    res.send(result);
});
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});