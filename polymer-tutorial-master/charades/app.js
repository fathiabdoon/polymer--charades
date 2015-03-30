
var express 	= require('express.io'),
	app			= express(),
	server		= require('http').createServer(app),
	io			= require('socket.io').listen(server),
	rooms		= {}, //this will be a map with key as code and array of players
	players		= {},
	flag		= {}; //this will be a map with key as username and value of sockets

	//colorindex	= {}; //this will be used to keep track of what color index we are on, so we can randomly assign colors to the players
	//colors		= ["red", "green", "blue", "purple", "yellow", "orange", "cyan"];




//on connection do this
io.sockets.on('connection', function(socket) {







	//if the client emits new group then do this
	socket.on("new group", function(data, callback){
		
		//console.log("server: new group");


		var room = socket.id;

		//so the creator of the group can pass this code to all players
		socket.emit("new group code", socket.id);

		if(!(room in rooms))
		{
			//console.log("Successfully created a group, we have to wait for players to join now...");

			var listofplayers 	= new Array();


			socket.score		= 0;
			socket.username 	= data.username.toLowerCase();
			socket.players		= data.players;
			socket.time 		= data.time;
			socket.color 		= data.color;
			socket.room 		= room;

			//socket.isadmin 		= true;
			//socket.teams		= data.teams;
			//socket.autoassign	= data.autoassign;

			//this will generate random colors for the team
/*			var teamcolorindex = []
			while(teamcolorindex.length < socket.teams)
			{
			  var randomnumber=Math.ceil(Math.random()*colors.length-1);
			  var found=false;
			  for(var i=0;i<teamcolorindex.length;i++){
				if(teamcolorindex[i]==randomnumber){found=true;break}
			  }
			  if(!found)teamcolorindex[teamcolorindex.length]=randomnumber;
			}
			
			socket.teamcolorindex = teamcolorindex;

			if(teamcolorindex.length > 0)
			{
				socket.color = colors[teamcolorindex[0]];
			}*/


			//console.log(socket.color);

			socket.join(socket.room);

			rooms[socket.id] 		= socket;
			players[socket.id] 		= socket;
			/*colorindex[socket.id] 	= 1; */

			
			//room is there, check if the username is not the same as anyone else in the room
			for(var i = 0; i < Object.keys(io.sockets.adapter.rooms[socket.room]).length; i++)
			{
				var eachplayerid 	= Object.keys(io.sockets.adapter.rooms[socket.room])[i];
				listofplayers.push(players[eachplayerid].username);
			}

			//console.log("Moving on to the waiting area from new group...");
			io.to(socket.room).emit("show players in waiting room", {listofplayers: listofplayers, numberofplayers: socket.players, room: socket.room});
			

			callback(true);
		}
		else
		{
			callback(false);
		}

		//console.log("server: EO new group");

	});//EO new group







	//if the client emites to join group then do this
	socket.on("join group", function(data, callback){

		//console.log("server: join group");

		if(!(data.room in rooms))
		{
			//console.log("server: I think you got the wrong code bud!");
			callback("I think you got the wrong code bud!");
			return;
		}
		else
		{

			var room 			= data.room;
			var admin 			= rooms[room];

			if(admin.players == Object.keys(io.sockets.adapter.rooms[room]).length)
			{
				//console.log("server: This room is full, go away intruder!");
				callback("This room is full, go away intruder!");
				return;
			}

			//room is there, check if the username is not the same as anyone else in the room
			for(var i = 0; i < Object.keys(io.sockets.adapter.rooms[room]).length; i++)
			{
				var eachplayerid = Object.keys(io.sockets.adapter.rooms[room])[i];
				if(players[eachplayerid].username == data.username)
				{
					//console.log("server: Someone in the group already has this name, try again!");
					callback("Someone in the group already has this name, try again!");
					return;
				}
			}

			

			socket.score		= 0;
			socket.username 	= data.username.toLowerCase();
			socket.players		= admin.players;
			socket.time 		= admin.time;
			socket.color 		= data.color;
			socket.room 		= room;

			//socket.isadmin 		= false;
			//socket.teams		= admin.teams;
			//socket.autoassign	= admin.autoassign;

/*			socket.color 		= colors[admin.teamcolorindex[colorindex[room]]];

			//assign a color
			if(colorindex[room] == socket.teams-1)
			{
				colorindex[room] = 0;
			}
			else
			{
				colorindex[room] = colorindex[room] + 1;
			}*/

			//console.log(socket.color);

			//the player will join the room
			socket.join(socket.room);
			//lets keep track of the player
			players[socket.id] 	= socket;




			if(Object.keys(io.sockets.adapter.rooms[socket.room]).length == socket.players)
			{
				//console.log("Everyone is here...");

				gotogamepage(socket.room);


			}
			else
			{
				//console.log("Still waiting....");

				var listofplayers 	= new Array();
				//room is there, check if the username is not the same as anyone else in the room
				for(var i = 0; i < Object.keys(io.sockets.adapter.rooms[socket.room]).length; i++)
				{
					var eachplayerid 	= Object.keys(io.sockets.adapter.rooms[socket.room])[i];
					listofplayers.push(players[eachplayerid].username);
				}
				io.to(room).emit("show players in waiting room", {listofplayers: listofplayers, numberofplayers: admin.players, room: socket.room});
			}
			//console.log("Moving on to the waiting area from joining group...");
			
		}

		//console.log("server: EO join group");

	}); //EO join group




	//socket.on("am ready", function(data){
	//	var room = data.code;

		//if(Object.keys(io.sockets.adapter.rooms[room]).length == soc)
	//});


/*	//lets assign each colors for the teams
	socket.on("am ready, go ahead", function(data){

		console.log("server: am ready, go ahead");

		var totalscore 	= {};
		var room 		= data.code; 

		//lets find out whats the total score for each time
		for(var i = 0; i < Object.keys(io.sockets.adapter.rooms[room]).length; i++)
		{

			var eachplayerid 	= Object.keys(io.sockets.adapter.rooms[room])[i];
			var color 			= players[eachplayerid].color;

			if(!(color in totalscore))
			{
				totalscore[color] = 0;
			}

			totalscore[color] = totalscore[color] + players[eachplayerid].score;
		}

		socket.emit("go to the game page", {totalscore: totalscore, color: socket.color, username: socket.username, time: socket.time, code: data.code});

		console.log("server: EO am ready, go ahead");

	}); //EO am ready, go ahead, pick my color*/


	var randomword = "test";

	socket.on("reset the game page", function(data){
		gotogamepage(socket.room);
	});

	socket.on("get me a word", function(data, callback){

		randomword = randomword + data.type;

		if(data.type == "g")
		{
			socket.score = socket.score + 1;
		}

		//all other players with similar color will not see start button
		for(var i = 0; i < Object.keys(io.sockets.adapter.rooms[socket.room]).length; i++)
		{
			var eachplayerid 	= Object.keys(io.sockets.adapter.rooms[socket.room])[i];
			if(players[eachplayerid].color == socket.color && players[eachplayerid].username != socket.username)
			{
				players[eachplayerid].emit("hide start button", {currentplayer: socket.username});
			}
			else if( players[eachplayerid].username != socket.username )
			{
				players[eachplayerid].emit("show word", {currentplayer: socket.username, word: randomword});
			}
		}


		if(randomword.length > 20)
			randomword = "t";

		callback(randomword);
	});



	//if the user closes page, then do this
	socket.on('disconnect', function() {

		delete players[socket.id];

		//if last player disconnect, then we dont need this room anymore
		if(players.length == 0)
		{
			delete rooms[socket.room];
			//delete colorindex[socket.room];
		}

	});


	function gotogamepage(room)
	{
		//lets find out whats the total score for each time
		var totalscore = gettotalscores(room);
		for(var i = 0; i < Object.keys(io.sockets.adapter.rooms[room]).length; i++)
		{
			var eachplayerid 	= Object.keys(io.sockets.adapter.rooms[room])[i];
			players[eachplayerid].emit("go to the game page", {totalscore: totalscore, color: players[eachplayerid].color, username: players[eachplayerid].username, time: players[eachplayerid].time});
		}

	}

	function gettotalscores(room){

		//console.log("working with room: " + room);

		var totalscore 	= {}; 
		for(var i = 0; i < Object.keys(io.sockets.adapter.rooms[room]).length; i++)
		{
			var eachplayerid 	= Object.keys(io.sockets.adapter.rooms[room])[i];
			var color 			= players[eachplayerid].color;
			if(!(color in totalscore))
			{
				totalscore[color] = 0;
			}
			totalscore[color] = totalscore[color] + players[eachplayerid].score;
		}
		return totalscore;
	}


});//EO connection



app.use(express.static(__dirname + '/'));


app.get('/', function(req, res) {
	console.log("im ready");
    res.sendfile(__dirname + '/charades.html')
})



//listen to port 30000
server.listen(3000)