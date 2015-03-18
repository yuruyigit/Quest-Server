---
title: Server Architecture
template: api.hbt
---

# Server Architecture

## Installation and Examples

Please look [here](./../index.md).


# Components

As far as it goes, all the logical functions are built as components. These can be exchanged via the event system. If the component type is certainly present or must be, can also be accessed directly to a particular component.

## Quest Server API

It's always the world and connection components present in order for Quest starts.

### Events

##### Example

```js
QuestServer.on('world:ready', function() {
	// Listen Event 'ready' from world.
});
```

`//ToDo:` List all Events

### Other Components

If other components are added to your use, you can also access them. Components are addressed on its type. This allows it e.g. may be different Connection Module without the other components need to be adjusted.

##### Examples

```js

if (!QuestServer.components.hasOwnProperty('myAwesomeOtherComponent')) {
	console.log("Error: I need myAwesomeOtherComponent!");
} else {
	QuestServer.components.myAwesomeOtherComponent.knowFunction(doYourStuff);
}

```

## Template

```js

function MyComponent(options) {
	// my component options handling...
}

// Before beginning the start phase, all components are initiated.
MyComponent.prototype.init = function(QuestServer, callback) {
	// Add your Listener
	QuestServer.on('world:ready', function() {
		// If world ready
	});

	// Check your dependencies
	if (!QuestServer.components.hasOwnProperty('myAwesomeComponent')) {
		console.log("Error: I need MyAwesomeComponent!");
	}

	// Use GameLoop
	QuestServer.on('loop:tick', function(tick) {
		/* Tick
		{
			frameCount: 234,
			delta: 0.034
		}
		*/
	});

	callback(); // or callback(err)
}

// Call by start in order
MyComponent.prototype.start = function(QuestServer, callback) {
	
	callback(err); // or callback()
};

MyComponent.prototype.getComponentType = function() {
	return 'world'; // Register under this Name at QuestServer.
}

module.exports = MyComponent;

```

`//ToDo:` Describe Quest Server object and individual functions.

# Database

`//ToDo:` It is planned to continue the support of a database module. So you can replace the database system at any time.

```js

var quest = new Quest()
	.use(new MyDatabaseComponent())
	...
	.start();

```

# Network

The network is in handling the Connection component. It can be easily replaced. In the standard component WebSockets are used and it is possible that all data example are packed in [Protobufs](https://developers.google.com/protocol-buffers/docs/overview).

## Data Packages

#### Request

```js
{
	username: 'Peter',
	password: 'hansi2345',
	viewportSizeW: 20, 		// Width
	viewPortSizeH: 20 		// Height
}
```

#### Response

```js
{
	code: CodeType, 			// see below
	worldName: 'QuestIsland', 	// Word / Server Name
	worldPlayers: 20, 			// Player Count
	playerId: 233 				// Unit ID from player to this in the AoI's to see again.
}
```

Code | Status
-----|-------
1    | OK - Login
2    | Server Full
3 	 | Duplicate Username
4    | Bad Words at Username
5    | Username Banned

#### AoI

The AoI *(Area of Interest)* defines all the interesting game objects for the unit. This means customers receive messages only to the immediate environment.

Sends all 250 milliseconds all players who join the new viewport or leave him.

```js
{
	unit_join: [
		{
			id: 3,			// Unit Id
			posX: 20,		// Pos X
			posY: 3,		// Pos Y
			name: 'Harry'	// Unitname
		}
	],
	unit_left: [2,54,2,56], // Unit IDs
}
```
