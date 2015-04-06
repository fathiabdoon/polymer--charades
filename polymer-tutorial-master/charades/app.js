
console.log("app.js invoking...");

var express 	= require('express.io'),
	app			= express(),
	server		= require('http').createServer(app),
	io			= require('socket.io').listen(server),
	groups		= {}, //this will be a map with key as code and array of players
	flag		= {}; //this will be a map with key as username and value of sockets
	//scores		= {};

var temp = {};



//on connection do this
io.sockets.on('connection', function(socket) {
	console.log("connection established...");
	//console.log(socket.id);

	socket.emit("group-code-from-create-new", {c: temp[0]});

	socket.on("create:group", function(data){

		var group 			= socket.id;

		if(!(group in groups))
		{
			socket.score			= 0;
			socket.username 		= data.username;
			socket.numberofplayers	= data.numberofplayers;
			socket.teamcolor 		= data.teamcolor;
			socket.group 			= group;
			

			socket.groupteam		= socket.group + "-" + socket.teamcolor;

			//join the group
			socket.join(socket.group);

			//join the groupteam
			socket.join(socket.groupteam);

			groups[socket.id] 		= socket;

			//scores[socket.id]		= {socket.teamcolor: ""};

			//temp
			temp[0] = socket.id;

			io.to(socket.group).emit("wait:room", {players: [socket.username], numberofplayers: socket.numberofplayers, group: socket.group});

		}//if(!(group in groups))

	}); //socket.on("create:group", function(data){


	socket.on("join:group", function(data, callback){


		if(!(data.groupcode in groups))
		{
			callback("I think you got the wrong code bud!");
			return;
		}

		var creator 		= 0;
		var players 		= [];
		var allteamcolors 	= [];

		//group is there, check if the username is not the same as anyone else in the group
		for(var i = 0; i < Object.keys(io.sockets.adapter.rooms[data.groupcode]).length; i++)
		{
			var eachplayerid = Object.keys(io.sockets.adapter.rooms[data.groupcode])[i];
			if(groups[eachplayerid].username == data.username)
			{
				callback("Someone in the group already has this name, try again!");
				return;
			}

			if(i == 0)
			{
				creator = groups[eachplayerid];
			}

			players.push(groups[eachplayerid].username);
		}

		
		socket.score			= 0;
		socket.username 		= data.username;
		socket.numberofplayers	= creator.numberofplayers;
		socket.teamcolor 		= data.teamcolor;
		socket.group 			= data.groupcode;

		//join the group
		socket.join(socket.group);

		groups[socket.id] 		= socket;

		players.push(socket.username);

		io.to(socket.group).emit("wait:room", {players: players, numberofplayers: socket.numberofplayers, group: socket.group});

	}); //socket.on("join:group", function(data){


	socket.on("show word to everyone", function(data){
		io.to(socket.group).emit("the word", {newword: data.word, username: socket.username, teamcolor: socket.teamcolor});

		if(data.timer)
		{
			io.to(socket.group).emit("time:start");
		}

/*		console.log(socket.id + "  --  " +   data.answered);

		if(data.answered)
		{
			socket.score = socket.score + 1;
		}*/

	});


	socket.on("save:score", function(data){
		//console.log(socket.id + " -- " + socket.score + " -- " + data.score);
		socket.score += data.score;
	});


	socket.on("hide all buttons for other players", function(){
		io.to(socket.group).emit("hide buttons", {username: socket.username});
	});


	socket.on("show:scores", function(data){

		var scores = {};
		for(var i = 0; i < Object.keys(io.sockets.adapter.rooms[socket.group]).length; i++)
		{
			var eachplayerid 	= Object.keys(io.sockets.adapter.rooms[socket.group])[i];
			var color 			= groups[eachplayerid].teamcolor;
			var s = 0;
			if(color in scores)
			{
				s = scores[color];
			}
			else
			{
				scores[color] = 0;
			}

			scores[color] = scores[color] + groups[eachplayerid].score;
		}

		socket.emit("show:scores", {scores: scores});

	});

});

app.use(express.static(__dirname + '/'));


app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html')
});




//listen to port 30000
server.listen(3000, function(){
	console.log("listening to 3000...");
});