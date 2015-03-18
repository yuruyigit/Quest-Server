// Protobuf Wrapper

var ProtoBufJs = require('protobufjs'),
	ByteBuffer = require('bytebuffer');

// Load Protobuf Files
var builder = ProtoBufJs.newBuilder({ convertFieldsToCamelCase: true });
ProtoBufJs.loadProtoFile(__dirname+"/proto/message.proto", builder);
ProtoBufJs.loadProtoFile(__dirname+"/proto/test.proto", builder);
ProtoBufJs.loadProtoFile(__dirname+"/proto/login.proto", builder);
ProtoBufJs.loadProtoFile(__dirname+"/proto/aoi.proto", builder);
ProtoBufJs.loadProtoFile(__dirname+"/proto/movement.proto", builder);

// Build Protobuf Files
var Quest = builder.build("quest"),
	MessageType = Quest.Message.MessageType; // Decode Message Types

function Protobuf() {

}

Protobuf.prototype.encode = function(packname, data, callback) {
	// Check Packname
	if (!Quest.hasOwnProperty(packname)) {
		callback("Packname not Found!", null);
		return;
	}

	// Pack at Message Object
	var pack = new Quest[packname](data);
	// Pack Object in Message
	var msg = new Quest.Message({type: MessageType[packname], data: pack.toBuffer()});

	callback(null, msg.toBuffer());
}

Protobuf.prototype.decode = function(data, callback) {
	try {
		var msg = Quest.Message.decode(data);

		// Find Package:
		var packname = this._getMessageTypeName(msg.getType());

		callback(null, packname, Quest[packname].decode(msg.getData()));
	} catch(err) {
		callback(err, null, null);
	}
}

Protobuf.prototype._getMessageTypeName = function(typeid) {
	var keys = Object.keys(MessageType);

	for (var i=0; i < keys.length; i++) {
		if (MessageType[keys[i]] == typeid)
			return keys[i];
	}

	return null;
}

module.exports = Protobuf;