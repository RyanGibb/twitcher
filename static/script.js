
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
var handles = [];
function addHandle(handle, number, number2) {
    var index = handles.indexOf(handle);
    console.log(index)
    if(index < 0) {
        handles.push(handle)
        refreshTable()
    }else {
        window.alert("User already exist");
    }
}
function removeHandle(handle){

    console.log(handles)
    var index = handles.indexOf(handle);
    if (index > -1) {
        handles.splice(index, 1);
    }
// array = [2, 9]
    console.log(handles);
    refreshTable()
}
function refreshTable(){
    let table = document.getElementById("UserList")
    let old_tbody = table.getElementsByTagName('tbody')
    var new_tbody = document.createElement('tbody');
    let count = 1
    handles.forEach(function(element) {

        let row = new_tbody.insertRow(0);
        let cell0 = row.insertCell(0);
        let cell1 = row.insertCell(1);
        let cell2 = row.insertCell(2);
        let cell3 = row.insertCell(3);
        let cell4 = row.insertCell(4);

        cell0.innerHTML = count;
        cell1.innerHTML = element;
        cell2.innerHTML = 100;
        cell3.innerHTML = 100;
        cell4.innerHTML = "<button class=\"deleteButton\" onclick='removeHandle(\"" + element + "\")'>Delete</button>";
        count++
    });
    console.log(new_tbody)
    console.log(old_tbody)
    table.replaceChild(new_tbody, old_tbody[0])


}

function handleMessage(message) {
    let obj = JSON.parse(message);



    if (obj.response === "guess") {
        console.log(obj.tweet.body)
    }
    /**----------------------------------------------**/
    else if (obj.response === "checkhandle") {
        if (!obj.valid) {
            console.log("does not exist")
            window.alert("This user does not exist");
            let handle = document.getElementById("twitterAccount").value;
            console.log(handle)
        }else{
            console.log("correct")
            let handle = document.getElementById("twitterAccount").value;
            console.log(handle)
            addHandle(handle,100,100)
        }

    }
    else if (obj.response === "error") {
        window.alert(obj.human_readable_error)
    }
}
function play() {
    if(handles.length > 1) {
        document.getElementById("FirstPage").style.display = "none";
        document.getElementById("SecondPage").style.display = "";
        getQuestion()
    }else{
        window.alert("You need to add at least 2 twitter accounts");
    }
}
function answer() {

}
function guess(){
    let request = "guess"
    let message = {request, handles};
    sendMessage(JSON.stringify(message));
}
function getQuestion(){
    guess()
    let tweetText= document.getElementById("TweetText")
    let buttons  = document.getElementById("answerButton")

}

