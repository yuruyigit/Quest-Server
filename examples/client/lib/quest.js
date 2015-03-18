// API

var Protobuf = require('../../shared/protobuf.js'),
	Connection = require('./connection.js'),
	util = require('util'),
	events = require('events');

function Quest() {
	var self = this;

	// Callbacks for Methods
	this.callbacks = {};

	this.Client = new Connection({pack: new Protobuf});

	this.Client.on('connect', function() {
		self.emit('connect');
	});

	this.Client.on('close', function() {
		self.emit('close');
	});

	this.Client.on('Test', function(data) {
		console.log("Test File!");
		console.log(data.getText());
	});

	this.Client.on('LoginResponse', function(data) {
		if (self.callbacks.hasOwnProperty('login')) {
			// Callback exist:
			self.callbacks.login(data.getCode(), data.getWorldName(), data.getWorldPlayers(), data.getPlayerId());
			delete self.callbacks.login;
		}
	});

	// New Unit join Viewport or left Viewport
	this.Client.on('AoI', function(data) {
		console.log('AoI!');
		var keys = Object.keys(data.unitJoin);
		for (var i = 0; i < keys.length; i++) {
			var unit = data.unitJoin[keys[i]];
			self.emit('unitJoin', { id: unit.id, pos: {x: unit.posX, y: unit.posY}, name: unit.name});
		}
		keys = Object.keys(data.unitLeft);
		for (var j = 0; j < keys.length; j++) {
			self.emit('unitLeft', data.unitLeft[keys[i]]);
		}
	});
}

util.inherits(Quest, events.EventEmitter);

Quest.prototype.login = function(username, password, viewportSize, callback) {
	if (this.callbacks.hasOwnProperty('login')) {
		console.log("Please wait... Login is running!");		
		return;
	}

	this.callbacks['login'] = callback;
	this.Client.send('LoginRequest', {username: username, password: password, viewportSizeW: viewportSize.w, viewportSizeH: viewportSize.h});
}

module.exports = Quest;