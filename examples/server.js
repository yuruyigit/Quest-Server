var QuestServer = require('./../questserver.js');

// Components
var Connection = require('./../components/wsconnection.js');
var World = require('./../components/world.js');
var Accounts = require('./../components/simpleaccounts.js');

// Protocol for Connection
var Protobuf = require('./shared/protobuf.js');

var server = new QuestServer()
	.use(new Connection({port: 9000, pack: new Protobuf()})) // Add Plugins
	.use(new World({tmx: __dirname+'/shared/map/Demo.tmx'}))
	.use(new Accounts({password: '1234'}))
	.start(); // Start Server
