// Web Socket Handling

var util = require('util'),
	events = require('events'),
	async = require('async');

function Connection(options) {
	var self = this;

	self.options = {
		host: 'ws://127.0.0.1:9000',
		pack: null // Decode / Encode Network Packages
	}

	// Override by Custom Options
	this.options = util._extend(this.options, options);

	console.log('Create Connection');

	// Create Websocket Server
	this.client = new WebSocket(self.options.host);
	this.client.binaryType = "arraybuffer";

	this.client.onopen = function(event) {
		console.log('connection!!');
		self.emit('connect');
	};

	this.client.onmessage = function(event) {
		self._msg(self.client, event.data);
	}

	this.client.onerror = function(err) {
		console.log("Connection Error: "+err);
	}

	this.client.onclose = function() {
		console.log("Connection Close");
		self.emit('close');
	}

}

// Add Event Functions
util.inherits(Connection, events.EventEmitter);

Connection.prototype.init = function() {

}

// Send to Client(s):
Connection.prototype.send = function(packname, data) {
	var self = this;

	// Run Step by Step
	async.waterfall([
		function(callback) { // Encode
			// Is De/Encode Packages active?
			if (self.options.pack) {
				self.options.pack.encode(packname, data, function(err, msg) {
					callback(err, msg);
				});
			} else {
				if (typeof data !== 'string')
					data = JSON.stringify(data); // Fallback

				callback(null, data); // Get Data to next Step (Send)
			}
		},
		function(msg, callback) { // Send
			self.client.send(msg);
			callback(null, 'done');
		}
	], function(err, results) {
		if (err)
			console.log(err);
	});
}

// Decode Client Messages
Connection.prototype._msg = function(client, msg) {
	var self = this;

	// Decode
	async.waterfall([
		function(callback) {
			// Is De/Encode Packages active?
			if (self.options.pack) {
				self.options.pack.decode(msg, function(err, packname, data) {
					callback(err, packname, data);
				});
			} else {
				try {
					// Json
					callback(null, 'msg', JSON.parse(msg));
				} catch(e) {
					// String
					callback(null, 'msg', msg);
				}
			}
		},
		function(packname, data, callback) {
			data.client = client;
			self.emit(packname, data);
			callback(null, 'done');
		}
	], function(err, result) {
		if (err)
			console.log(err);
	})

}

module.exports = Connection;