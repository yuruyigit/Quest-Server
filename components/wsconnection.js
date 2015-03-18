// Connection Component

var util = require('util'),
	async = require('async'),
	Log = require('nodejs-log');
var WebSocketServer = require('ws').Server;

function WsConnection(options) {
	var self = this;

	self.options = {
		port: 9000, // Port
		pack: null // Decode / Encode Network Packages
	}

	// Override by Custom Options
	this.options = util._extend(this.options, options);
}

// Call directly after Quest.use(MyComponent)
WsConnection.prototype.init = function(QuestServer, callback) {
	// Add your Listener
	QuestServer.on('client:connect', function(client) {});
	QuestServer.on('client:disconnect', function(client) {});
	QuestServer.on('client:msg', function(msg) {}); // Can't Parse Messages

	callback();
}

// Call by start in order
WsConnection.prototype.start = function(QuestServer, callback) {
	var self = this;

	Log.info('Create Connection', 'Connection');

	// Create Websocket Server
	var wss = new WebSocketServer({port: self.options.port});

	// Websocket Events:
	wss.on('connection', function(client) {
		// New Client
		Log.info("Client connect!", 'Connection');
		QuestServer.emit('client:connect', client);

		// New Message from Client		
	    client.on('message', function(message) {
	    	self._msg(QuestServer, client, message);
//			Log.info("Client send "+message, 'Connection');
	    });

	    // Client Disconnect
	    client.on('close', function close() {
	    	QuestServer.emit('client:disconnect', client);
			Log.info("Client disconnect.", 'Connection');
		});

	});

	callback();
};

// Send to Client(s):
WsConnection.prototype.send = function(packname, data, receiver) {
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
			// Send to more?
			if (util.isArray(receiver)) {
				// Yes
				async.each(receiver, function(client, done) {
					client.send(msg);
					done();
				}, function(err) {
					callback(err, 'done');
				});
			} else {
				// Single Receiver
				receiver.send(msg);
				callback(null, 'done');
			}
		}
	], function(err, results) {
		if (err)
			Log.error(err, 'Connection');
	});
}

// Decode Client Messages
WsConnection.prototype._msg = function(QuestServer, client, msg) {
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
			QuestServer.emit('client:'+packname, data);
			callback(null, 'done');
		}
	], function(err, result) {
		if (err)
			Log.error(err, 'Connection');
	})

}

WsConnection.prototype.getComponentType = function() {
	return 'connection'; // Register under this Name at QuestServer.
}

module.exports = WsConnection;