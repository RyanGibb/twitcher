
"use strict";

//----------------------------------------------------------------------------
//                              WebSocket Client
//----------------------------------------------------------------------------


const url = 'ws://' + location.hostname+ ":"+location.port+ '/twitcher/';
const connection = new WebSocket(url);

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

function onloadfunction() {

    connection.onmessage = (message) => {

        console.log(message);

        let messagestr = message.data.toString();
        try {
            let obj = JSON.parse(messagestr);
            /**----------------------------------------------**/
            if (obj.response === "quess") {
                //cleantable();
                //createTable(obj)
            }
            /**----------------------------------------------**/
            else if (obj.response === "check") {
                // console.log(obj.info.filecontent);
                //saveByteArray([binaryStringToArrayBuffer(obj.info.filecontent)], filetoDownload);
            }

        } catch (e) {
            console.log(e)
        }
    }


}

function checkUsername() {
    let handle = document.getElementById("TwitterAccount").value;

    let message = {

        request: "checkhandle",
        handle: handle,
    };
    console.log(message)
    connection.send(JSON.stringify(message));
}


function handleMessage(message) {
  // do something
}
