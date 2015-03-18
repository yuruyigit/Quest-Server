// World Component

var util = require('util'),
	async = require('async'),
	Log = require('nodejs-log'),
	tmx = require('tmx-parser'),
	Gameloop = require('node-gameloop');

function World(options) {
	var self = this;

	self.options = {
		tmx: null // Map File
	}

	// Override by Custom Options
	self.options = util._extend(this.options, options);

	self.clients = [];
	self.nextUnitID = 1;
	self.units = {};
	self.removedUnits = [];

	if (!self.options.tmx) {
		Log.error("I need a TMX Map!", 'World:Map');
		return;
	}

}

// Call directly after Quest.use(MyComponent)
World.prototype.init = function(QuestServer, done) {
	var self = this;

	Log.info("Parse Map...", "World:Map");

	QuestServer.on('loop:tick', function(tick) {
		self.update(QuestServer, tick);
	});

	// Parse Map File
	tmx.parseFile(self.options.tmx, function(err, map) {
		if (err) done(err);

		self.collisionMap = {};
		self.options.size = {w: map.width, h: map.height};

		// Find Collision Layers:
		async.each(map.layers, function(layer, callback) {
			// If Collision?
			if (layer.properties.hasOwnProperty('collision') && layer.properties.collision) {
				Log.info('Layer '+layer.name+' has Property `collision`!', "World:Map");

				for (var x = 0; x < map.width; x++) {
					if (!self.collisionMap.hasOwnProperty(x))
						self.collisionMap[x] = {};
					
					for (var y = 0; y < map.height; y++) {
						self.collisionMap[x][y] = (typeof layer.tileAt(x,y) !== 'undefined');
					}
				}
			}
			// No Error
			callback();
		}, function(err) {
			if (err) done(err);

			Log.info("Map is parsed!", 'World:Map');
			done();
		});
	});

}

// Start
World.prototype.start = function(QuestServer, callback) {
	var self = this;

	// Debug CollisionMap Output
	/*for (var u = 0; u < self.options.size.h; u++) {
		var line = [];
		for (var o = 0; o < self.options.size.w; o++) {
			line.push((self.collisionMap[o][u])?'B':'D');
		}
		console.log(line.join(''));
	}*/

	callback();
}

// Add Client to World
World.prototype.addClient = function(client) {
	// Get ID
	client.id = this.nextUnitID;
	this.nextUnitID++;

	this.clients.push(client);

	var unit = {
		id: client.id,
		pos: {x: Math.floor((Math.random() * 100) + 1), y: 0},
		name: client.username,
		client: client,
		aoi: { units: {} }
	};

	this.units[unit.id] = unit;
	client.unit = unit;

	// Return Unit Id from Client
	return client.id;
}

// Remove Client from World
World.prototype.removeClient = function(client) {
	var index = this.clients.indexOf(client);
	if (index > -1) {
		this.clients.splice(index, 1);
	}

	if (this.units.hasOwnProperty(client.unit.id)) {
		delete this.units[client.unit.id];
	}

	removedUnits.push(client.unit.id);
}

World.prototype.update = function(QuestServer, tick) {
	var self = this;
//	Log.info('Update! '+tick.delta, 'World:Loop');

	// Check AoI
	var keys = Object.keys(self.units);	

	for (var i = 0; i < keys.length; i++) {
		var unit = self.units[keys[i]];

		var joinAoI = { units: [] };
		var leftAoI = { units: [] };

		// Find all other Clients at Viewport
		for (var j = 0; j < keys.length; j++) {
			var other = self.units[keys[j]];

			// If other Unit in Viewport
			if ((unit.pos.x-unit.client.viewportSize.w/2 <= other.pos.x) && // Left Border
				(unit.pos.x+unit.client.viewportSize.w/2 >= other.pos.x) && // Right Border
				(unit.pos.y-unit.client.viewportSize.h/2 <= other.pos.y) && // Top Border
				(unit.pos.y+unit.client.viewportSize.h/2 >= other.pos.y)) { // Bottom Border

				if (!unit.aoi.units.hasOwnProperty(other.id)) {
					// Add to Area of Interest
					unit.aoi.units[other.id] = other;
					joinAoI.units.push({ // Format for Package
						id: other.id,
						posX: other.pos.x,
						posY: other.pos.y,
						name: other.name,
					});
				}
			} else if (unit.aoi.units.hasOwnProperty(other.id)) {
				// Out of Viewport
				leftAoI.units.push(other.id);
			}
		}

		if (removedUnits.length > 0)
			leftAoI.units = leftAoI.units.concat(removedUnits);

		// Send Client all new UoI's and Removed UoI's
		if (joinAoI.units.length > 0 || leftAoI.units.length > 0) {
			QuestServer.components.connection.send('AoI', {unitJoin: joinAoI.units, unitLeft: leftAoI.units }, unit.client);
		}
	}

	// Clear leftAoI's
	removedUnits = [];

	// ToDo: Check Movement
}

World.prototype.getUserCount = function() {
	return this.clients.length;
}

// ToDo: Client Router to Client World!

// Return Component Name
World.prototype.getComponentType = function() {
	return 'world';
}

module.exports = World;
