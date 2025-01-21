# NAD C338 Controller

## Overview
This is a RESTful API controller app for interacting with a node.js proxy server, for basic controls of the NAD C338 amplifier.

It uses JavaScript for the front-end and Express.js for the back-end server.

## Server usage
From the root directory, run `npm run start-servers` to start the collection of servers. Use Ctrl+C to stop the server.

### API server
Run `npm run api-server` to start the API server. Use Ctrl+C to stop the server.

### TCP server
Run `npm run tcp-server` to start the TCP server. Use Ctrl+C to stop the server.

Ensure the binding on port 30001 is available.

## Client usage
See nad-c338-api for OpenAPI specification