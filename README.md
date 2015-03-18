# Quest Server [MMORPG]

Quest is a multiplayer role play game engine.  This repository contains the server. It is easily extensible through plugins.


You may know him from the live coding stream on [livecoding.tv](https://www.livecoding.tv/pkuebler).

## Getting Started

The Quest Server is completely based on plugins. However, it must always be present a Connection and a World plugin with certain features. For more information, please see the [documentation](docs/index.md) in the `/docs` folder.

```js

// Example from /examples/server.js

var server = new QuestServer()
	.use(new Connection({port: 9000})) // Add Plugins
	.use(new World({tmx: '../shared/map/Demo.tmx'}))
	.use(new Accounts({password: '1234'}))
	.start(); // Start Server

```

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

## Unit Testing

*Planned for the future.*

## Documentation

For more information, please see the [documentation](docs/index.md) in the `/docs` folder.

## Dependencies

## About InteractiveResearchLabs
We are a association of indie developers, graphic designers and video creators. We work together on several projects and help each other with it's own projects.

## License (MIT and Creative Commans)

[MIT](./LICENSE) for the **server** code, and CC-BY for the art and music.

The license terms for the server code you see in the Github repository.