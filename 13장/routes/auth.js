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

const sha = require('sha256');

let session = require('express-session');

router.get('/session', function(req, res) {
    if(isNaN(req.session.milk)){
        req.session.milk = 0;
    }
    req.session.milk = req.session.milk + 1000;
    req.send("session : " + req.session.milk  + "원");
})
router.get('/cookie', function(req, res){
    let milk = parseInt(req.signedCookies.milk) + 1000;
    if(isNaN(milk)){
        milk = 0;
    }
    res.cookie('milk', milk, {signed : true});
    res.send('product : ' + milk + '원');
})


//세션, 쿠키 12주차 입니다.
router.use(session({
    secret : 'dkufe8938493j4e08349u',
    resave : false,
    saveUninitialized : true,
}))
router.get('/login', function(req, res){
    console.log(req.session);
    if(req.session.user){
        console.log('세션 유지');
        res.render('index.ejs', {user: req.session.user});
    }else{       
        res.render('login.ejs');
    }
});



router.post('/login', function(req, res){
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


router.get('/logout', function(req, res){
    console.log('로그아웃');
    req.session.destroy();
    res.render('index.ejs', {user: null});
});

router.get('/signup', function(req, res){
    res.render('signup.ejs');
});

router.post("/signup", function(req, res){
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








module.exports = router;