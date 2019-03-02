
//----------------------------------------------------------------------------
//                              Twitter API
//----------------------------------------------------------------------------





//----------------------------------------------------------------------------
//                              HTTP Server
//----------------------------------------------------------------------------

const express = require('express');
const http = require('http');

//let port = process.getuid(); // type "id" on Linux for uid value
// if (port < 1024) port += 10000; // do not use privileged ports
let port = process.env.PORT || 8080;

const app = express();
const static_dir = 'static';

app.use(express.static(static_dir));

const httpServer = http.createServer(app);
const localhost = '127.0.0.1';

httpServer.listen(port, localhost, function () {
  console.log('Listening for HTTP requests on localhost, port ' + port);
});

//----------------------------------------------------------------------------
//                              WebSocket Server
//----------------------------------------------------------------------------

const ws = require('ws');

const maxLogMessageLength = 200;

const wsServer = new ws.Server({server: httpServer});

wsServer.on('connection', function(ws, req) {
  console.log('WS connection');

  ws.on('close', function(code, message) {
    console.log('WS disconnection - Code ' + code);
  });

  ws.on('message', function(data) {
    let messageString = data.toString();
    console.log('WS -> rx ' + (messageString.length > maxLogMessageLength ? messageString.slice(0, maxLogMessageLength) + "..." : messageString)
    );

    try {
      var receivedMessage = JSON.parse(messageString);
    }
    catch(error) {
      respondError(ws, req, 'error parsing JSON request', error);
      return;
    }

    if (receivedMessage.request == 'guess') {
      let parameters = receivedMessage.handles;
      if(!parameters) {
        respondError(ws, req, 'missing handles for "guess" request');
      }
      // select random tweet
      // query api
    }
    else {
      respondError(ws, req, 'unsupported request "' + receivedMessage.request + '"');
    }

  })
});

function respondError(ws, req, human_readable_error, error) {
  let responce = 'error';
  responceMessage = {responce, human_readable_error, error};
  respond(ws, req, responceMessage);
}



function respond(ws, req, responceMessage) {
  var messageString = JSON.stringify(responceMessage);
  ws.send(messageString);
  console.log('WS <- tx ' + (messageString.length > maxLogMessageLength ? messageString.slice(0, maxLogMessageLength) + "..." : messageString)
  );
};

console.log('WebSocket server running');
