



const mongoclient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017';
// mongoclient.connect(uri)
//     .then(client=>{
//         app.listen(8080, function(){
//             console.log('포트 8080으로 서버 대기중...');
//         });
//     }).catch(err=> console.error(err));

let mydb;

mongoclient.connect(uri)
    .then((client) => {
        mydb = client.db('dbfirst');
        // mydb.collection('post').find().toArray().then(result => {
        //     console.log(result);
        // });



        app.listen(8080, function(){
            console.log('포트 8080으로 서버 대기중...');
        });
    })

    .catch( (err) =>{
        console.log(err);     
    });





const express = require('express');
const app = express();

// app.listen(8080, function(){
//     console.log("포트 8080으로 서버 대기중...");
// })

app.get('/book', function(req, res){
    res.send('도서목록 관련 페이지입니다.');
});

app.get('/', function(req, res){
    //res.send('도서 목록 관련 페이지 입니다.');
    res.sendFile(__dirname + '/index.html');
});

app.get('/list', function(req, res){
    mydb.collection('post').find().toArray().then(result =>
        console.log(result))
});
