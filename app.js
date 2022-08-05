const bodyParser = require("body-parser");
const express = require("express");
const _ = require("lodash")
const request = require("http")
const mysql = require('mysql2');
const session = require('express-session');
const path = require('path');
const dataFormatacao = require(__dirname + "/formatacao.js")

const port = 8081;
const app = express();
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Og1@2022*',
  database: 'nodelogin'
});

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

let nameUser = '';
let ocorrenciasDia = '';

app.get('/', function(req, res) {
  req.session.destroy()
  req.session = null
  res.render('login')
});

app.post('/auth', function(request, response) {

  // Capture the input fields
  let username = request.body.login;
  let password = request.body.senha;
  nameUser = username;
  // Ensure the input fields exists and are not empty
  if (username && password) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      if (results.length > 0) {
        // Authenticate the user
        request.session.loggedin = true;
        request.session.username = username;
        // Redirect to home page
        response.redirect('/home');
      } else {
        response.send('Incorrect Username and/or Password!');
      }
      response.end();
    });
  } else {
    response.send('Please enter Username and Password!');
    response.end();
  }
});

app.get('/home', function(req, res) {
  if (req.session.loggedin) {
    connection.query(`SELECT o.*, r.versaoSolucao, r.baseTestada FROM ocorrencias o LEFT JOIN resolvidas r ON o.numeroOcorrencia = r.numOcorrencia WHERE dataOcorrencia BETWEEN '${dataFormatacao.dataAnteriorInvertida}'AND'${dataFormatacao.dataInvertida}'`, function(error, results, fields) {
      ocorrenciasDia = results;
      // Output username
      console.log(results)
      res.render('home', {
        user: nameUser,
        tables: ocorrenciasDia
      })
    });
  } else {
    // Not logged in
    res.redirect('/')
  }
  // res.end();
});
app.get('/ocorrencia', function(req, res) {
  res.render('ocorrencia', {
    user: nameUser,
    data: dataFormatacao.dataInvertida
  })
})
app.post('/ocorrencia', function(req, res) {
  const obj = {
    numOcorrencia: req.body.nOcorrencia,
    moduloOcorrencia: req.body.modulo,
    dataOcorrencia: req.body.dataOcorrencia,
    versaoErro: req.body.versaoErro,
    cliente: req.body.clienteOcorrencia,
    descricao: req.body.descricaoOcorrencia,
    versaoSolucao: req.body.versaoSolucao,
    base: req.body.baseTestada
  }
  connection.query(`INSERT INTO ocorrencias VALUES (${obj.numOcorrencia},'${obj.descricao}','${obj.cliente}',
	'${obj.dataOcorrencia}','${obj.versaoErro}','${obj.moduloOcorrencia}','F')`, function(error, results, fields) {
    console.log(obj)
    console.log(error)
  });
  res.redirect('/home')
});
app.get('/resolver/:nocorrencia', function(req, res) {
  const numeroResolver = _.lowerCase(req.params.nocorrencia)
  res.render('resolver', {
    user: nameUser,
    nocorrencia: numeroResolver
  });
});
app.post('/resolver/:nocorrencia', function(req, res) {
  const numeroParametro = _.lowerCase(req.params.nocorrencia)
  const objResolvidos = {
    procedimento: req.body.prodOcorrencia,
    versaoSolucao: req.body.versaoSolucao,
    baseTestada: req.body.baseTestada,
    ocorrencia: numeroParametro
  }

connection.query(`INSERT INTO resolvidas(numOcorrencia,versaoSolucao,baseTestada,procedimentos) VALUES(${objResolvidos.ocorrencia}, '${objResolvidos.versaoSolucao}', '${objResolvidos.baseTestada}', '${objResolvidos.procedimento}') `)
connection.query(`UPDATE ocorrencias A
INNER JOIN resolvidas B ON A.numeroOcorrencia = B.numOcorrencia
SET A.resolvida = 'T'
WHERE A.resolvida IS NOT NULL`)
  res.redirect('/home')
});


app.listen(port, function() {
  console.log(`Server rodando na porta ${port}`)
});
