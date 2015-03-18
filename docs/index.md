---
title: Home
template: index.hbt
---

# Quest [MMORPG]

## Overview

Quest is a multiplayer role play game engine.  This repository contains the server. It is easily extensible through plugins.

# More

* [Client API](./apis/client-js.md)
* [Server Architecture](./apis/server.md)

# Map

Quest used Tiled MapFiles *(tmx)*. [Tiled](http://www.mapeditor.org/) is a open Mapeditor.

In order not to make tiles walkable, you have to create them on one or more additional layers. Right-click on the layer you can change the properties. Add here left `collision` and right `true`

# Clients

At present, no final clients are known to us. If you have, please contact us and we'll take him on. 

## Currently in development

* *[Quest-Game](https://github.com/InteractiveResearchLabs/Quest-Game)* from [Morphesus](https://github.com/morphesus)

# Client API's

Client APIs are libraries that help you to communicate with the server Quest. *Note:* Not every API supports all servers Components.

- JavaScript
	- [QuestJS API](./apis/client-js.md) (*unstable*) 
	- QuestUnity (*planned*)

# Server

## Installation

Use the [NPM](https://www.npmjs.com) installer:

```bash
npm install quest-server
```

**Note:** The client API is written at the time only for debugging and not used productively.

The test client may examine the protobuf files in the wrong folder. It runs through [browserify](http://browserify.org). So you can generate a new bundle.js.

```bash
cd /examples/client
browserify app.js -o bundle.js
```

## Usage

```js

// Example from /examples/server.js

var server = new QuestServer()
	.use(new Connection({port: 9000, pack: new Protobuf()})) // Add Plugins
	.use(new World({tmx: '../shared/map/Demo.tmx'}))
	.use(new Accounts({password: '1234'}))
	.start(); // Start Server

```

## Components

### Connection
#### Packs
### World
### Simple Accounts

# ToDo

- Connection Class for Client and Server. Share it.
- Movement / Packages update
- Protobuf as Component not as Option
- Use a Storage Class
- Add Unit Movement
- Add Movement Collision Control
- Add NPC's
- Send to Server Velocity X and Y!!!!
