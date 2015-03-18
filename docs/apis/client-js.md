---
title: Client API
template: api.hbt
---

# Client API

Client APIs are libraries that help you to communicate with the server Quest. Note: Not every API supports all servers Components.

# QuestJS API

## Install

A first attempt of all QuestJS you can find in the `/examples/client` folder.

**Note:** The client API is written at the time only for debugging and not used productively.

The test client may examine the protobuf files in the wrong folder. It runs through [browserify](http://browserify.org). So you can generate a new bundle.js.

```bash
cd /examples/client
browserify app.js -o bundle.js
```

## Examples

### Initialize

```js
var quest = new Quest();

quest.on('unitJoin', function(unit) {
	// Unit join Viewport	
});

quest.on('unitLeft', function() {
	// Unit left Viewport
});
```

### Login

`quest.login(username, password, viewportSize, callback)`

Try to Login on the QuestServer. **Note:** Returns the Response only as `callback`!

* `username` the Username
* `password` By use `simpleaccounts` the Server Password
* `viewportSize` Gamewindow size `{w: 200, h: 100}`
* `callback` Server Response **Note:** Is Response negative, is only `code` given

```js
quest.login(username, '1234', {w: 300, h: 160}, function(code, worldName, worldPlayers, playerId) {

/*
	Callback:

	code: 1 // Response code below
	worldName: 'Quest World' // World Name
	worldPlayers: 234 // Count of Players
	playerId: 3 // Unit Id from Player to identify the own unit.
 */

});
```

Code | Status
-----|-------
1    | OK - Login
2    | Server Full
3 	 | Duplicate Username
4    | Bad Words at Username
5    | Username Banned

## Events

### connect

Fired when a connection is established to the server.

```js
quest.on('connect', function() {
	// Connected
	// You can now Login...
});
```

### close

Fired when a connection is close to the server.

```js
quest.on('close', function() {
});
```

### unitJoin

Fired when a unit join in the viewport.
*Note:* It is transmitted as well as the unit of the player.

You will get the `unit` as callback argument.

```js
quest.on('unitJoin', function(unit) {
	console.log(unit);
/*
	{
		id: 34, // Unit Id
		pos: { // Position in Pixel
			x: 45, 
			y: 23
		}, 
		name: 'Harry'
	}

*/
});
```

### unitLeft

Fired when a unit left the viewport.
You will get the `unit.id` as callback argument.

```js
quest.on('unitLeft', function(unitId) {
	console.log(unitId);
	// Result: 4 // Id from the Unit.
});
```