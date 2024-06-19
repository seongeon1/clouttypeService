require('dotenv').config();
const mongoclient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');
const uri =  process.env.DB_URI;
// mongoclient.connect(uri)
//     .then(client=>{
//         app.listen(8080, function(){
//             console.log('포트 8080으로 서버 대기중...');
//         });
//     }).catch(err=> console.error(err));

let mydb;

const port = process.env.PORT;
mongoclient.connect(uri)
    .then((client) => {
        mydb = client.db('dbfirst');
        // mydb.collection('post').find().toArray().then(result => {
        //     console.log(result);
        // });



        app.listen(port, function(){
            console.log('포트 3000으로 서버 대기중...');
        });
    })

    .catch( (err) =>{
        console.log(err);     
    });

const express = require('express');
const bodyParser = require('body-parser');
const sha = require('sha256');
const app = express();

let cookieParser = require('cookie-parser');
let session = require('express-session');
//body-parser 라이브러리 추가
app.set('view engine', 'ejs');

//app use로 시작하는 코드는 무조건 미들웨어이다.
//const db  = require('node-mysql/lib/db');
// JSON 파싱을 위한 body-parser 설정
app.use(bodyParser.json());
// URL 인코딩된 데이터 파싱을 위한 body-parser 설정
app.use(bodyParser.urlencoded({ extended: true }));
//정적 파일라이브러리 추가.
app.use(express.static("public"));
app.use(cookieParser('ncvka0e398423kpfd'));


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

//auth-------------------------------------------------------------------
app.get('/cookie', function(req, res){
    let milk = parseInt(req.signedCookies.milk) + 1000;
    if(isNaN(milk)){
        milk = 0;
    }
    res.cookie('milk', milk, {signed : true});
    res.send('product : ' + milk + '원');
})
//세션, 쿠키 12주차 입니다.
app.use(session({
    secret : 'dkufe8938493j4e08349u',
    resave : false,
    saveUninitialized : true,
}))

app.get('/session', function(req, res) {
    if(isNaN(req.session.milk)){
        req.session.milk = 0;
    }
    req.session.milk = req.session.milk + 1000;
    req.send("session : " + req.session.milk  + "원");
})

app.get('/', function(req, res){
    if(req.session.user){
        console.log('세션 유지');
        res.render('index.ejs', {user: req.session.user});
    }else {
        console.log("user: null");
        res.render("index.ejs", {user : null});
    }
});


app.get('/login', function(req, res){
    console.log(req.session);
    if(req.session.user){
        console.log('세션 유지');
        res.render('index.ejs', {user: req.session.user});
    }else{       
        res.render('login.ejs');
    }
});


app.post('/login', function(req, res){
    console.log('아이디: ' + req.body.userid);
    console.log('비밀번호: '+ (sha(req.body.userpw)));

    mydb  
        .collection('account')
        .findOne({userid: req.body.userid}) //req.body = {userid: ~~, userpw: ~~} 
        .then((result) => {
            if (result == null) {res.send('일치하는 정보를 찾을 수 없습니다.' )

            }
            else if(result.userpw == sha(req.body.userpw)){
                console.log("로그인 성공");
                req.session.user = req.body;  //sha(pw)가 아닌 그냥pw를 담음 because 예제이기 때문에 그렇지 
                // 닉네임 같은 sub키를 담는게 일반적이라 생각함 담는게 일반적이라 생각함.
                  //여기서req.session.user를 생성하는것으로보여짐.
                console.log("새로운 로그인"); 
                res.render('index.ejs', {user: req.session.user}); 
            } else{
                console.log("로그인 실패");
                res.render('login.ejs');
            }
        });
});

app.get('/logout', function(req, res){
    console.log('로그아웃');
    req.session.destroy();
    res.render('index.ejs', {user: null});
});

app.get('/signup', function(req, res){
    res.render('signup.ejs');
});

app.post("/signup", function(req, res){
    console.log(req.body.userid);
    console.log(sha(req.body.userpw));
    console.log(req.body.usergroup);
    console.log(req.body.useremail);

    mydb
    .collection('account')
    .insertOne({
        usrid: req.body.userid, 
        userpw:sha(req.body.userpw), 
        usergroup: req.body.usergroup, 
        useremail: req.body.useremail
    })
    .then((result) => {
        console.log('회원가입 성공');
    })
    res.redirect('/');
})

//---------------------------------------------------------------------------------------------------
app.get('/list', function(req, res){
    mydb.collection('post').find().toArray().then(result =>{
        console.log(result);
        data = result;
        res.render('list.ejs',data);
    });
});

app.post("/delete", function(req, res){
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


app.get('/content/:id', function(req, res) {
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


app.get("/edit/:id", function(req,res){
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

app.post('/edit', function(req, res){
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

//----------------------------------------------------------------------------------------------

// app.post('/enter', (req, res) => {
//     console.log(req.body);
//     res.sendFile(__dirname + '/enter.html');
// });

app.get('/enter', (req, res) => {
    
    //res.sendFile(__dirname + '/enter.html');
    res.render('enter.ejs');
});

let upload = multer({storage: storage});
// 설정한 storage를 multer의 storage 속성에 설정하고 upload 변수에 대입
let imagepath ='';
app.post('/photo', upload.single('picture'), function(req,res){
    console.log(req.file.path);
    imagepath = '\\' + req.file.path;
    console.log('image path: ' + imagepath);
    
})

//13주차 28p 게시물 검색 기능 구현
app.get('/search', function(req, res){
    console.log(req.query);
    mydb
    .collection('post')
    .find({title: req.query.value}).toArray()
    .then((result) =>{
        if (result == null){
            console.log('No results found');
        }else{
            result = result.map(post =>{
                post.path = post.path.replace(/\\public\\image\\/,"/image/");
                return post;
            })
            console.log(result);
            res.render('sresult.ejs', {data: result});


        }
    })
})

app.post('/save', function(req, res){
    
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