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
let ocorrenciaFiltrada = '';
let filtro = '';
let registro = '';
let registrado = '';
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
    connection.query(`SELECT o.*, r.versaoSolucao, r.baseTestada FROM ocorrencias o LEFT JOIN resolvidas r ON o.id = r.idOcorrencia WHERE dataOcorrencia BETWEEN '${dataFormatacao.dataAnteriorInvertida}'AND'${dataFormatacao.dataInvertida}'`, function(error, results, fields) {
      ocorrenciasDia = results;
      registro = results.length
      if (registro !== ''){
        registro = `Registros: ${registro}`
      }
      // Output username
      // console.log(results)
      res.render('home', {
        user: nameUser,
        tables: ocorrenciasDia,
        filtro: "",
        registro: registro
      })
    });
  } else {
    // Not logged in
    res.redirect('/')
  }
  // res.end();
});
app.get('/filtrados', function(req, res) {
  if (req.session.loggedin) {
  if (registro !== '' && registrado === ''){
    registrado = registro;
    registro = `Registros: ${registro}`
  }else{
    registro = `Registros: ${registrado}`
  }

  res.render('home', {
    user: nameUser,
    tables: ocorrenciaFiltrada,
    filtro: filtro,
    registro: registro
  })
  filtro = "";
}else{
  res.redirect('/')
}
});

app.post('/filtrados', function(req, res) {
  const obj = {
    ocorrencia: req.body.nOcorrencia,
    cliente: req.body.clienteOcorrencia,
    solucao: req.body.versaoSolucao,
    dataInicio: req.body.dataInicial,
    descricao: req.body.descricaoOcorrencia,
    erro: req.body.versaoErro,
    baseTeste: req.body.baseTestada,
    dataFim: req.body.dataFinal,
    radio: req.body.check,
    status: req.body.selectStatus,
    user: nameUser,
    procedimentos: req.body.procedimento,
    page: req.body.filtroPage
  }
  console.log(obj)
  if (obj.status !== '') {
    filtro = `Filtrado por: ${obj.status}`
  }
  if (obj.procedimentos === undefined){
    obj.procedimentos = ""
  }
  const arrayTodos = [];
  const arraySelecionados = [];
  let arrayTratado = '';
  const datas = `and dataOcorrencia between '${obj.dataInicio}' and '${obj.dataFim}'`
  const versaoErro = `and versaoErro = '${obj.erro}'`
  const versaoSolucao = `and versaoSolucao = '${obj.solucao}'`
  const descricao = `and descricaoOcorrencia like '%${obj.descricao}%'`
  const baseTestada = `and baseTestada = '${obj.baseTeste}'`
  const resolvido = `and resolvida = '${obj.radio}'`
  const status = `and status = '${obj.status}'`
  const cliente = `and clienteOcorrencia = '${obj.cliente}'`
  arrayTodos.push(datas, versaoErro, versaoSolucao, descricao, baseTestada, resolvido, status, cliente)

  arrayTodos.forEach(function(dado) {
    if (!dado.includes("''") && !dado.includes("'%%'")) {
      arraySelecionados.push(dado)
    }
  });
  arraySelecionados.forEach(function(dado) {
    arrayTratado += dado
  });

  if (obj.ocorrencia !== '') {
      connection.query(`SELECT o.*, r.versaoSolucao, r.baseTestada ${obj.procedimentos}
      FROM ocorrencias o
      LEFT JOIN resolvidas r ON o.id = r.idOcorrencia
      WHERE o.numeroOcorrencia = '${obj.ocorrencia}'`, function(error, results, fields) {
      ocorrenciaFiltrada = results
      registro = results.length
      registrado = results.length
    });
  } else if (arrayTratado === '') {
    connection.query(`SELECT o.*, r.versaoSolucao, r.baseTestada ${obj.procedimentos}
    FROM ocorrencias o
    LEFT JOIN resolvidas r ON o.id = r.idOcorrencia LIMIT 500`, function(error, results, fields) {
      ocorrenciaFiltrada = results
      registro = results.length
      registrado = results.length
      console.log(results)
    });
  } else {
    if (obj.dataInicio !== '' && obj.dataFim === '' || obj.dataFim !== '' && obj.dataInicio === '' || obj.dataInicio > obj.dataFim) {
      console.log("Erro ao selecionar Data")
    } else {
      let subArrayTratado = arrayTratado.substr(3)
      connection.query(`SELECT o.*, r.versaoSolucao, r.baseTestada ${obj.procedimentos}
      FROM ocorrencias o
      LEFT JOIN resolvidas r ON o.id = r.idOcorrencia
      WHERE ${subArrayTratado}`, function(error, results, fields) {
        ocorrenciaFiltrada = results
        registro = results.length
        registrado = results.length
      });
    }
  }
  if(obj.page === 'filtro'){
    res.redirect('/filtrados')
  }else{
    res.redirect('/relatorio/pesquisados')
  }

});
app.get('/ocorrencia', function(req, res) {
  if (req.session.loggedin) {
  res.render('ocorrencia', {
    user: nameUser,
    data: dataFormatacao.dataInvertida
  })
}else{
  res.redirect('/')
}
})

app.post('/ocorrencia', function(req, res) {
  const obj = {
    numOcorrencia: req.body.nOcorrencia,
    moduloOcorrencia: req.body.modulo,
    dataOcorrencia: req.body.dataOcorrencia,
    versaoErro: req.body.versaoErro,
    cliente: req.body.clienteOcorrencia,
    descricao: req.body.descricaoOcorrencia,
    status: req.body.statusOcorrencia
  }
  const array = []
  array.push(obj.numOcorrencia, obj.moduloOcorrencia,obj.dataOcorrencia,obj.versaoErro,obj.cliente,obj.descricao,obj.status)
  if(array.indexOf('') > -1){
    console.log("erro")
  }else{
  connection.query(`INSERT INTO ocorrencias (numeroOcorrencia,descricaoOcorrencia,clienteOcorrencia,dataOcorrencia,versaoErro,modulo,resolvida,status) VALUES (${obj.numOcorrencia},'${obj.descricao}','${obj.cliente}',
	'${obj.dataOcorrencia}','${obj.versaoErro}','${obj.moduloOcorrencia}','F', '${obj.status}')`, function(error, results, fields) {
    console.log(obj)
    console.log(error)
  });
  res.redirect('/home')
  }
});
app.get('/resolver/:nocorrencia', function(req, res) {
  if (req.session.loggedin) {
  let ocorrenciaResolvida = ''
  const numeroResolver = _.lowerCase(req.params.nocorrencia)
  connection.query(`SELECT r.* FROM resolvidas r INNER JOIN ocorrencias o ON r.idOcorrencia = o.id WHERE o.numeroOcorrencia = '${numeroResolver}'`, function(error, results, fields) {
    ocorrenciaResolvida = results;
    res.render('resolver', {
      user: nameUser,
      nocorrencia: numeroResolver,
      selecionados: ocorrenciaResolvida
    });
  });
}else{
  res.redirect('/')
}
});
app.post('/resolver/:nocorrencia', function(req, res) {
  let idOcorrencia = '';
  const numeroParametro = _.lowerCase(req.params.nocorrencia)
  const objResolvidos = {
    procedimento: req.body.prodOcorrencia,
    versaoSolucao: req.body.versaoSolucao,
    baseTestada: req.body.baseTestada,
    ocorrencia: numeroParametro
  }
  connection.query(`Select id from ocorrencias WHERE numeroOcorrencia = '${objResolvidos.ocorrencia}'`,function(error, results, fields) {
  results.forEach(function(data){
    idOcorrencia = data.id
  });
  connection.query(`SELECT idOcorrencia FROM resolvidas WHERE idOcorrencia = '${idOcorrencia}'`,function(error, results, fields){
  if(results.length === 0){
  connection.query(`INSERT INTO resolvidas(idOcorrencia,versaoSolucao,baseTestada,procedimentos) VALUES(${idOcorrencia}, '${objResolvidos.versaoSolucao}', '${objResolvidos.baseTestada}', '${objResolvidos.procedimento}') `)
  }else{
  connection.query(`UPDATE resolvidas SET versaoSolucao = '${objResolvidos.versaoSolucao}', baseTestada = '${objResolvidos.baseTestada}', procedimentos = '${objResolvidos.procedimento}' WHERE idOcorrencia = ${idOcorrencia}`)
  }
  connection.query(`UPDATE ocorrencias A
  INNER JOIN resolvidas B ON A.id = B.idOcorrencia
  SET A.resolvida = 'T'
  WHERE A.resolvida IS NOT NULL`)
  });

  });
  res.redirect('/home')
});

app.get('/relatorio',function(req,res){
if (req.session.loggedin) {
  res.render('relatorio', {user: nameUser})
}else{
  res.redirect('/')
}
})

app.get('/relatorio/pesquisados',function(req,res){
if (req.session.loggedin) {
  if (registro !== '' && registrado === ''){
    registrado = registro;
    registro = `Registros: ${registro}`
  }else{
    registro = `Registros: ${registrado}`
  }
  res.render('relatorioGerado', {user: nameUser,tables: ocorrenciaFiltrada,registro: registro})

}else{
  res.redirect('/')
}
})


app.listen(port, function() {
  console.log(`Server rodando na porta ${port}`)
});
