// Quest Server

var util = require('util'),
	events = require('events'),
	async = require('async'),
	Log = require('nodejs-log'),
	Gameloop = require('node-gameloop');

function QuestServer() {

	/*
		Required Components:		
		connection: null, // Connection Component for example WebSockets
		world: null // World have own Component / Plugin System
	*/

	this.components = {}
	// Call .start in Order
	this.componentsOrder = [];

}

// Add Event Functions
util.inherits(QuestServer, events.EventEmitter);

// Add Plugin / Component
QuestServer.prototype.use = function(component) {
	var self = this;

	if (typeof component.getComponentType !== 'function') {
		Log.error('No valid Component. Please read the fucking manual!', 'Use');
		return;
	}
	// ToDo: Check Component Name

	// Exist Component
	if (this.components.hasOwnProperty(component.getComponentType())) {
		Log.warn('You override Component `'+component.getComponentType()+'`!', 'Use');

		// Remove old Place
		var index = this.componentsOrder.indexOf(component.getComponentType());
		if (index > -1) {
			this.componentsOrder.splice(index, 1);
		}
	} else {
		// Component's not used from Basic System
		// Your Component's can use other Components
		Log.info('Add custom Component `'+component.getComponentType()+'`.', 'Use');
	}
	this.components[component.getComponentType()] = component;

	// Add Start Order
	this.componentsOrder.push(component.getComponentType());

	return this;
}

// Start Server
QuestServer.prototype.start = function() {
	var self = this;

	// Check required Components:
	if (typeof this.components.connection !== 'object') {
		Log.error('Need a Connection Component!');
		return;
	} else if (typeof this.components.world !== 'object') {
		Log.error('Need a World Component.');
		return;
	}

	// Init all Components and Start all Components
	async.waterfall([
	    function(callback) {
	    	Log.info('Init Components...', 'Use');

	    	// Init
	    	async.each(self.componentsOrder, function(key, cb) {
				self.components[key].init(self, cb);
	    	}, function(err) {
	    		if (err) callback(err);

				Log.info('Components finished init process', 'Use');
	
		        callback(null);
	    	});

	    },
	    function(callback) {
	    	Log.info('Start Components...', 'Use');

			// Start Engine
			async.each(self.componentsOrder, function(key, cb) {
				self.components[key].start(self, cb);
			}, function(err) {
				if (err) callback(err);

		        callback(null);
			});

	    },
	    function(callback) {
	    	// Start Game Loop

	    	Log.info('Start Loop', 'Loop');

			var frameCount = 0;
			this.gameloop = Gameloop.setGameLoop(function(delta) {
			    // `delta` is the delta time from the last frame
			    self.update({frameCount: frameCount, delta: delta});
			}, 1000 / 30);	    	

			callback();
	    }
	], function (err) {
		if (err) Log.error(err, 'Use');
	});
}

QuestServer.prototype.update = function (tick) {
	this.emit('loop:pretick', tick);
	this.emit('loop:tick', tick);
	this.emit('loop:aftertick', tick);
}


module.exports = QuestServer;