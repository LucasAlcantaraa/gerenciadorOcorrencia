const bodyParser = require("body-parser");
const express = require("express");
const _ = require("lodash")
const request = require("http")
const mysql = require('mysql2');
const session = require('express-session');
const path = require('path');

const port = 8081;
const app = express();
const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'Og1@2022*',
	database : 'nodelogin'
});

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let nameUser = '';

app.get('/', function(req,res){
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

app.get('/home',function(req,res){
	if (req.session.loggedin) {
		// Output username
		res.render('home', {user:nameUser})
	} else {
		// Not logged in
		res.render('login')
	}
	res.end();


});

app.listen(port, function(){
  console.log(`Server rodando na porta ${port}`)
});
