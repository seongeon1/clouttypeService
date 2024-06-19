var router = require('express').Router();
const dotenv = require('dotenv').config({path : '../13장/.env'});
const mongoclient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');


const uri =  process.env.DB_URI;//'mongodb://localhost:27017';
// mongoclient.connect(uri)
//     .then(client=>{
//         router.listen(8080, function(){
//             console.log('포트 8080으로 서버 대기중...');
//         });
//     }).catch(err=> console.error(err));

//multer npm 13주차 10page
let multer = require('multer');
let storage = multer.diskStorage({
    destination : function(req, file, done){
        done(null, './public/image')
    },
    filename : function(req, file, done){
        done(null, file.originalname);
    }
})

let mydb;

mongoclient
    .connect(uri)
    .then((client) => {
        mydb = client.db('dbfirst');
    })
    .catch( (err) =>{
        console.log(err);     
    });
router.get('/enter', (req, res) => {

    //res.sendFile(__dirname + '/enter.html');
    res.render('enter.ejs');
});

router.post('/save', function(req, res){

    mydb.collection('post').insertOne(
        {title: req.body.title, 
        content : req.body.content, 
        date : req.body.someDate,
        path : imagepath,
    })
    .then(result => {
        console.log(result);
        console.log('데이터 추가 성공');
        
    });
    res.redirect('/list');
    
});


module.exports = router;

