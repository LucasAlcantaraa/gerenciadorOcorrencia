const bodyParser = require("body-parser");
const express = require("express");
const _ = require("lodash")
const request = require("http")


const port = 8081;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get('/', function(req,res){
res.render('login')
});
app.get('/home',function(req,res){
res.render('home')
});

app.listen(port, function(){
  console.log(`Server rodando na porta ${port}`)
});
