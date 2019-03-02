
"use strict";

//----------------------------------------------------------------------------
//                              WebSocket Client
//----------------------------------------------------------------------------


const wsUrl = 'wss://' + location.hostname+ ":"+location.port+ '/twitcher/';
const ws = new WebSocket(wsUrl);

ws.onopen = function() {
  //do something
}

ws.onclose = function() {
  alert("WebSocket closed. Please reload the page.");
}

ws.onerrer = function(e) {
  alert("WebSocket Error: " + e + ". Please reload the page.");
}

ws.onmessage = function(m) {
  let messageString = m.data;
  console.log("<- rx " + messageString);
  let message = JSON.parse(messageString);
  handleMessage(message);
}

function sendMessage(messageString) {
  console.log("-> tx " + messageString);
  ws.send(messageString);
}

function checkUsername() {
    let handle = document.getElementById("twitterAccount").value;
    let request = "checkhandle"
    let message = {request, handle};
    sendMessage(JSON.stringify(message));
}

function handleMessage(message) {
  if (obj.response === "quess") {
      //cleantable();
      //createTable(obj)
  }
  /**----------------------------------------------**/
  else if (obj.response === "checkhandle") {
    if(!obj.valid){
      let handle = document.getElementById("twitterAccount").value;
    }

}
