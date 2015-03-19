// Client

// Use Quest Client API
var Quest = require('./lib/quest.js');

function DebugClient() {
	var self = this;

	self.quest = new Quest();

	// Connect to Server?
	self.isConnect = false;

	self.playerUnit = null;

	// All Unit Objects
	self.units = {};

	// Viewport
	self.viewport = $('#viewport');

	// Framecount
	self.frameCount = 0;

	// Bind Quest API Events
	self.quest.on('connect', function() {
		self._tryLogin();
	});

	self.quest.on('close', function() {
		clearInterval(self.loop);
		self.isConnect = false;
	});

	// Unit join the Viewport (Area of Interest)
	self.quest.on('unitJoin', function(unit) {
		self._unitJoin(unit);
	});

	// Unit left the Viewport (Area of Interest)
	self.quest.on('unitLeft', function(id) {
		self._unitLeft(id);
	});

	// Unit has e.g. new Position...
	self.quest.on('unitUpdate', function(unit) {
		self._unitUpdate(unit);
	});
}

DebugClient.prototype._startLoop = function() {
	var self = this;

	self.loop = setInterval(function() {
		self._run();
	}, 1000/30);
}

// Simple GameLoop
DebugClient.prototype._run = function() {
	var self = this;

	self.frameCount++;

	if (!self.units || self.units.length == 0)
		return;

	// Update all Units:
	var keys = Object.keys(self.units);

	for (var i = 0; i < keys.length; i++) {
		var unit = self.units[keys[i]];

		console.log(unit.name + ": " + unit.velocity);

		if (unit.velocity.x != 0) {
			unit.pos.x += unit.velocity.x;
		}
		if (unit.velocity.y != 0) {
			unit.pos.y += unit.velocity.y;
		}

		// Unit is changed:
		$(unit.gameObject).css({
			left: unit.pos.x,
			top: unit.pos.y
		});

	}

	// Send 3 times the second at Server
	if (self.frameCount % 10 == 0 && self.playerUnit) {
		// ToDo: Send to Server Velocity X and Y!!!!
		self.quest.movement(self.playerUnit.pos, self.playerUnit.direction, self.playerUnit.velocity);
	}

}

DebugClient.prototype._tryLogin = function() {
	var self = this;	

	var username = prompt("Please enter your name", "Harry Potter");

	self.quest.login(username, '1234', {w: $(self.viewport).width(), h: $(self.viewport).height()}, function(code, worldName, worldPlayer, playerId) {
		console.log(code);
		// User Feedback
		if (code == 1) {
			self.isConnect = true;
			console.log(worldName+" say Welcome to you");
			self._startLoop();
		} else if (code == 2) {
			alert("Server Full!");
		} else if (code == 3) {
			alert("Duplicate Username! Wait 10 Seconds and try it again...");
			setTimeout(self._tryLogin(), 10000);
		} else if (code == 4) {
			alert("Your Username is bad... Wait 10 Seconds and try it again...");
			setTimeout(self._tryLogin(), 10000);
		} else if (code == 5) {
			alert("Go somewhere else to play ...");
		}
	});
}

// New Unit Join the Viewport from this player.
DebugClient.prototype._unitJoin = function(unit) {
	var self = this;

	console.log(unit.name+' joined your Viewport!');

	unit.direction = 0;
	unit.velocity = {x: 0, y: 0};

	// Create new Player Object
	var obj = $('<div class="unit"></div>');
	$(obj).attr('id', 'unit_'+unit.id);
	// Set Pos
	$(obj).css({
		position: 'absolute',
		left: unit.pos.x,
		top: unit.pos.y
	});

	unit.gameObject = $(obj);

	self.units[unit.id] = unit;

	// Add to Viewport
	self.viewport.append(obj);

	// If Unit from this Player?
	console.log(self.quest.playerId+"=="+unit.id);
	if (self.quest.playerId == unit.id)
		self.playerUnit = unit;
}

DebugClient.prototype._unitLeft = function(id) {
	var self = this;

	// If Unit exist at the Storage
	if (self.units.hasOwnProperty(id)) {
		// Remove GameObject from Viewport
		$(self.units[id].gameObject).hide(200, function() {
			$(this).remove();	
		});

		// Unit remove from Storage
		delete self.units[id];
	}
}

DebugClient.prototype._unitUpdate = function(unit) {
	var self = this;

	// ToDo: Own Unit override
	if (unit.id == self.quest.playerId)
		return;

	// Exist the Unit in the local Storage?
	if (!self.units.hasOwnProperty(unit.id)) {
		return;
	}

	// GameObject update by the Gameloop
	self.units[unit.id].pos = unit.pos;
	self.units[unit.id].direction = unit.direction;
	self.units[unit.id].velocity = unit.velocity;

	// Unit is changed:
	$(self.units[unit.id].gameObject).css({
		left: unit.pos.x,
		top: unit.pos.y
	});
}

$( document ).ready(function() {
    console.log( "ready!" );

	var client = new DebugClient();

	$(document).keydown(function(event) {
		//console.log(event);
		// Player has no Unit
		if (!client.playerUnit) {
			console.log("Error: No Player Unit!");
			return;
		}

		// Set the velocity
		if (event.keyCode == 87) {
			// Up
			client.playerUnit.velocity.y = -2;
		} else if (event.keyCode == 83) {
			// Down
			client.playerUnit.velocity.y = 2;
		}

		if (event.keyCode == 65) {
			// Left
			client.playerUnit.velocity.x = -2;
		} else if (event.keyCode == 68) {
			// Right
			client.playerUnit.velocity.x = 2;
		}

	});

	$(document).keyup(function(event) {
		// Player has no Unit
		if (!client.playerUnit)
			return;

		// Set the velocity
		if (event.keyCode == 87) {
			// Up
			client.playerUnit.velocity.y = 0;
		} else if (event.keyCode == 83) {
			// Down
			client.playerUnit.velocity.y = 0;
		}

		if (event.keyCode == 65) {
			// Left
			client.playerUnit.velocity.x = 0;
		} else if (event.keyCode == 68) {
			// Right
			client.playerUnit.velocity.x = 0;
		}

	});
});
