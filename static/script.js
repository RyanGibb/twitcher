
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

//----------------------------------------------------------------------------
//                              HTML Manipulation
//----------------------------------------------------------------------------

function checkUsername() {
    let handle = document.getElementById("twitterAccount").value;
    let request = "userinfo"
    let message = {request, handle};
    sendMessage(JSON.stringify(message));
}

var handles = [];
var dictTweetCount = [];
var dictFollowerCount = [];
function addHandle(handle, tweetCount, followerCount) {
    var index = handles.indexOf(handle);
    console.log(index)
    if(index < 0) {
        dictTweetCount[handle] = tweetCount
        dictFollowerCount[handle] = followerCount

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
        console.log(dictTweetCount)
        console.log(dictFollowerCount)
        console.log(dictTweetCount[element])
        cell0.innerHTML = count;
        cell1.innerHTML = element;
        cell2.innerHTML = dictTweetCount[element];
        cell3.innerHTML = dictFollowerCount[element];
        cell4.innerHTML = "<button class=\"deleteButton\" onclick='removeHandle(\"" + element + "\")'>Delete</button>";
        count++
    });
    console.log(new_tbody)
    console.log(old_tbody)
    table.replaceChild(new_tbody, old_tbody[0])
}

var answer
function handleMessage(obj) {
    if (obj.response === "guess") {
        let tweetText= document.getElementById("TweetText")
        tweetText.innerText = obj.tweet.body
        answer = obj.tweet.handle
        let buttons  = document.getElementById("answerButtons")
        buttons.innerHTML = ""
        handles.forEach(function (element) {
            var btn = document.createElement("BUTTON");        // Create a <button> element
            var t = document.createTextNode(element);       // Create a text node
            btn.appendChild(t);                                // Append the text to <button>
            document.body.appendChild(btn);
            btn.onclick = function(){
                answerQuestion(element)
            };
            buttons.appendChild(btn)
        })
    }
    /**----------------------------------------------**/
    else if (obj.response === "userinfo") {
        if (!obj.user.valid) {
            console.log("does not exist")
            window.alert("This user does not exist");
            let handle = document.getElementById("twitterAccount").value;
            console.log(handle)
        } else {
            console.log("correct")
            let handle = document.getElementById("twitterAccount").value;
            console.log(handle)
            addHandle(handle, obj.user.tweet_count,obj.user.follower_count)
        }

    }
    else if (obj.response === "error") {
        window.alert(obj.human_readable_error + " : " + obj.error);
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
function answerQuestion(guess) {
    if(answer === guess ){
        alert("ggwp")
    }
}
function guess(){
    let request = "guess"
    let message = {request, handles};
    sendMessage(JSON.stringify(message));
}
function getQuestion(){
    guess()


}
