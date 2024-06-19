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

let mydb;

mongoclient
    .connect(uri)
    .then((client) => {
        mydb = client.db('dbfirst');
    })
    .catch( (err) =>{
        console.log(err);     
    });

let upload = multer({storage: storage});
// 설정한 storage를 multer의 storage 속성에 설정하고 upload 변수에 대입
let imagepath ='';
router.post('/photo', upload.single('picture'), function(req,res){
    console.log(req.file.path);
    imagepath = '\\' + req.file.path;
    console.log('image path: ' + imagepath);
    
})
router.get('/list', function(req, res){
    mydb.collection('post').find().toArray().then(result =>{
        console.log(result);
        data = result;
        res.render('list.ejs',data);
    });
});

router.post('/edit', function(req, res){
    //console.log('수정요청입니다.', req.body);
    req.body.id = new ObjectId(req.body.id);
    //console.log('req.body.id입니다.', req.body.id);
    
    mydb.collection('post')
    .updateOne({_id: req.body.id},
        {$set : {title: req.body.title, 
            content : req.body.content, 
            date : req.body.someDate,
            path : imagepath,
        }})
    .then(result => {
        console.log('수정완료');
        res.redirect('/list');//여기페이지로 이동.
    })
    .catch((err)=> {
        console.log(err);
    });
    
    
});


router.post("/delete", function(req, res){
    console.log(req.body._id); // 확인차
    const id = new ObjectId(req.body._id); // ObjectId로 변환
    console.log(id); 
    mydb.collection('post').deleteOne({_id: id}) //이렇게 해야됨 책은 req.body 라고 되어잇는데 잘못됨 _id: 오브젝트아이디 이런 형식이어야됨.
    .then(result => {
        console.log('삭제완료');
        res.status(200).send(); //http 통신성공여부 상태코드 10주차81p
    })
    .catch(error => {
        console.error('삭제 실패:', error);
        res.status(500).send('삭제 실패');
    });
    //디비에서 오브젝트 아이디를 이용해 documet를 제거하려면 npm i objectid 해야됨.
    // 디비 삭제관련 페이지 10주차 72쪽
});


router.get('/content/:id', function(req, res) {
    console.log(req.params.id);
    req.params.id = new ObjectId(req.params.id);
    mydb
        .collection('post')
        .findOne({_id: req.params.id})
        .then((result) => {
            console.log(result);  
            let imagePath = result.path.replace(/\\public\\image\\/,"/image/");
            console.log(imagePath);
            res.render('content.ejs', {data: {...result, path: imagePath}});          
            
        });
});


router.get("/edit/:id", function(req,res){
    console.log(req.params.id);
    req.params.id = new ObjectId(req.params.id);
    mydb
        .collection('post')
        .findOne({_id: req.params.id})
        .then((result) => {
            console.log(result);
            if(result.path){
                result.path = result.path.replace(/\\public\\image\\/, "/image/");
            }
            res.render('edit.ejs', {data : result});
        });
})




module.exports = router;


