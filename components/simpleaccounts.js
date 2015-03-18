// Basic User Managment
// Protect Server with a password and check Usernames

var util = require('util'),
	Log = require('nodejs-log');

function Accounts(options) {
	var self = this;

	self.options = {
		password: null, // Server Password
		maxUsers: 20
	};

	self.storage = {
		usernames: []
	};

	// Override by Custom Options
	self.options = util._extend(this.options, options);
}

Accounts.prototype.init = function(QuestServer, callback) {
	var self = this;

	// Set listener:
	QuestServer.on('client:LoginRequest', function (data) {
		self._handleLogin(QuestServer, data);
	});

	callback();
}

Accounts.prototype.start = function(QuestServer, callback) {
	callback();
}

// Handle Login
Accounts.prototype._handleLogin = function(QuestServer, data) {
	var self = this;

	Log.info('User '+data.getUsername()+' try to connect', 'Accounts');

	/*
		Codes: 
		1 OK - Login
		2 Server Full
		3 Duplicate Username
		4 Bad Words at Username
		5 Username Banned
	*/

	var responseCode = 1;
	if (self.storage.usernames.indexOf(data.getUsername()) > -1) {
		// Duplikate Username!
		responseCode = 3;
	} else if (self.storage.usernames.length >= self.options.maxUsers) {
		// Server is Full!
		responseCode = 2;
	}

	// Create Response Data Obj
	var response = {
		code: responseCode
	}

	if (responseCode == 1) {
		// Login is successful
		
		// Update Client:
		data.client.username = data.getUsername();
		// Save Viewport Size:
		data.client.viewportSize = {w: data.getViewportSizeW(), h: data.getViewportSizeH()};

		// Set Username in the "used"-List
		self.storage.usernames.push(data.getUsername());

		// Add Client to World and get the Unit ID
		var unitId = QuestServer.components.world.addClient(data.client);

		// Add optional Informations:
		response['worldName'] = 'Quest World';// Name;
		response['worldPlayers'] = self.storage.usernames.length;
		response['playerId'] = unitId;
	}

	// Send to Client
	QuestServer.components.connection.send('LoginResponse', response, data.client);

}

Accounts.prototype.getComponentType = function() {
	return 'accounts';
}

module.exports = Accounts;