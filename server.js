//Setup web server and socket
var twitter = require('twitter'),
    express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

//Setup twitter stream api
var twit = new twitter({
  consumer_key: 'YOUR CONSUMER KEY',
  consumer_secret: 'YOUR CONSUMER SECRET',
  access_token_key: 'YOUR ACCESS TOKEN KEY',
  access_token_secret: 'YOUR ACCESS TOKEN SECRET'
}),
stream = null;

//Use the default port (for beanstalk) or default to 8081 locally
server.listen(process.env.PORT || 8081);

//Setup routing for app
app.use(express.static(__dirname + '/public'));


//Creates a transport object in route handler 
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
var auth = {
  auth: {
    api_key: 'YOUR MAILGUN API KEY',
    domain: 'YOUR MAILGUN DOMAIN'
  }
}

var nodemailerMailgun = nodemailer.createTransport(mg(auth));


	


//Start Connection with Mysql
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'HOST OF YOUR DATABASE',
  user     : 'YOUR DB USER',
  password : 'DB PASSWORD',
  database : 'NAME OF YOUR DATABASE'
});

//Database Test
connection.connect();

connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;

  console.log('Start ---> TWITSISBRA');
});

//connection.end();





//Create web sockets connection.
io.sockets.on('connection', function (socket) {

  socket.on("start tweets", function() {





	//Load Array of Cities, their Latitudes and Longitudes
	var fs = require('fs');

	var cities = [];
	var fileContents = fs.readFileSync('lat_long_cidades.txt');
	var lines = fileContents.toString().split('\n');

	for (var i = 0; i < lines.length; i++) {
	    cities.push(lines[i].toString().split(','));
	}

	/*for (var i = 0; i < lines.length; i++) {
	    for (var j = 0; j < 3; j++) {
		console.log(cities[i][j]);
	    }
	    console.log('\n');
	}*/







    if(stream === null) {
      //Connect to twitter stream passing in filter for entire world.'locations':'-180,-90,180,90',   ,,'locations':'-180,-90,180,90'
      twit.stream('statuses/filter', {'track':'sismo,terremoto,tremeu,abalo,tremor,explosão,detonação'}, function(stream) {
          stream.on('data', function(data) {
		
		//console.log(data.text);
		/*if(data.place !== null){
			console.log(data.place['name'] + ' ' + data.text);
		}
		else{
			console.log(data.text);
		}*/

		//console.log(data);
		
		if (data.coordinates){
			console.log("-1-"+ ' ' + data.text);

		  //If so then build up json and send out to web sockets
		  var outputPoint = {"lat": data.coordinates.coordinates[0],"lng": data.coordinates.coordinates[1]};

		  socket.broadcast.emit("twitter-stream", outputPoint);

		  //Send out to web sockets channel.
		  socket.emit('twitter-stream', outputPoint);
			
			var horario = new Date(data.created_at);
			var post  = {Texto: data.text, Latitude: data.coordinates.coordinates[0], Longitude: data.coordinates.coordinates[1], Horario: horario};
			var query = connection.query('INSERT INTO tweets SET ?', post, function(err, result) {

			});
			
			/*
			nodemailerMailgun.sendMail({
			  from: 'mandrade006@gmail.com',
			  to: 'mandrade006@gmail.com', // An array if you have multiple recipients.
			  subject: 'Alerta Terremoto!',
			  text: 'Texto: ' + data.text + ', Latitude: ' + cities[i][2] + ' , Longitude: ' + cities[i][1]+ ', Horario: ' + horario
			}, function (err, info) {
			  if (err) {
				console.log('Error: ' + err);
			  }
			  else {
				console.log('Response: ' + info);
			  }
			});
			*/
			
		}
		else if(data.place !== null){
			console.log("-2-"+ ' ' + data.place['name'] + ' ' + data.text);

			var i = 0;
			var found = 1;
			while(found != 0 && i < lines.length){
				found = cities[i][0].localeCompare(data.place['name']);
				if (found == 0){
					break;
				}
				i++;
				//console.log(cities[i][0]);
			}

			if(found == 0){
				// Build json object and broadcast it

					var outputPoint = {"lat": cities[i][2],"lng": cities[i][1]};
							socket.broadcast.emit("twitter-stream", outputPoint);

				//Send out to web sockets channel.
						socket.emit('twitter-stream', outputPoint);

				var horario = new Date(data.created_at);
				var post  = {Texto: data.text, Cidade: data.place['name'], Latitude: cities[i][2], Longitude: cities[i][1], Horario: horario}
				var query = connection.query('INSERT INTO tweets SET ?', post, function(err, result) {
	  				
				});
				
				/*
				nodemailerMailgun.sendMail({
				  from: 'mandrade006@gmail.com',
				  to: 'mandrade006@gmail.com', // An array if you have multiple recipients.
				  subject: 'Alerta Terremoto!',
				  text: 'Texto: ' + data.text + ', Cidade: ' + cities[i][0] + ', Latitude: ' + cities[i][2] + ' , Longitude: ' + cities[i][1]+ ', Horario: ' + horario
				}, function (err, info) {
				  if (err) {
					console.log('Error: ' + err);
				  }
				  else {
					console.log('Response: ' + info);
				  }
				});
				*/
				
			}

		}
		else{
			var i = 0;
			var found = -1;
			//console.log(found);
			while(found < 0 && i < lines.length){
				var city = new RegExp(cities[i][0], 'i');
				found = data.text.search(city);
				if (found >= 0){
					break;
				}
				i++;
				//console.log(cities[i][0]);
			}
			
			if(found > -1){
				console.log("-3-"+ ' ' + cities[i][0] + ' ' + data.text);
				// Build json object and broadcast it

					var outputPoint = {"lat": cities[i][2],"lng": cities[i][1]};
							socket.broadcast.emit("twitter-stream", outputPoint);

				//Send out to web sockets channel.
						socket.emit('twitter-stream', outputPoint);
				var horario = new Date(data.created_at);
				var post  = {Texto: data.text, Cidade: cities[i][0], Latitude: cities[i][2], Longitude: cities[i][1], Horario: horario}
				var query = connection.query('INSERT INTO tweets SET ?', post, function(err, result) {
	  				
				});
				
				/*
				nodemailerMailgun.sendMail({
				  from: 'mandrade006@gmail.com',
				  to: 'mandrade006@gmail.com', // An array if you have multiple recipients.
				  subject: 'Alerta Terremoto!',
				  text: 'Texto: ' + data.text + ', Cidade: ' + cities[i][0] + ', Latitude: ' + cities[i][2] + ' , Longitude: ' + cities[i][1]+ ', Horario: ' + horario
				}, function (err, info) {
				  if (err) {
					console.log('Error: ' + err);
				  }
				  else {
					console.log('Response: ' + info);
				  }
				});
				*/
				
			}
			
			
		}
			  


              
	      stream.on('limit', function(limitMessage) {
                return console.log(limitMessage);
              });

              stream.on('warning', function(warning) {
                return console.log(warning);
              });

              stream.on('disconnect', function(disconnectMessage) {
                return console.log(disconnectMessage);
              });
          });
      });
    }
  });

    // Emits signal to the client telling them that the
    // they are connected and can start receiving Tweets
    socket.emit("connected");
});

