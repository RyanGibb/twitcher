
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
function addHandle(handle, tweetCount, followerCount,tweets) {
    if(tweetCount > 0){
    var index = handles.indexOf(handle);
    console.log(index)
    if(index < 0) {
        dictTweetCount[handle] = tweetCount
        dictFollowerCount[handle] = followerCount

        handles.push(handle)
        addJson(handle,tweets)
        refreshTable()

    }else {
        window.alert("User already exist");
    }}else{
        window.alert("The user has no tweets");
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
    let tabledisplay = document.getElementById("UserListTotal")
    let infoText = document.getElementById("infoText")
    let playButton = document.getElementById("playButton")
    if(handles.length == 0){
        table.style.display = "none"
        tabledisplay.style.display = "none"
    }else {
        table.style.display = ""
        tabledisplay.style.display = ""
    }
    if(handles.length < 2 ){
        infoText.style.display = ""
        playButton.disabled = true;
    }else{
        infoText.style.display = "none"
        playButton.disabled = false;
    }


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
        cell4.innerHTML = "<button class=\"deleteButton\"  onclick='removeHandle(\"" + element + "\")'>Delete</button>";
        count++
    });
    console.log(new_tbody)
    console.log(old_tbody)
    table.replaceChild(new_tbody, old_tbody[0])
}

let answer = ""
function handleMessage(obj) {
    if (obj.response === "blank") {
        let tweetText= document.getElementById("TweetText")
        tweetText.innerText = obj.tweet.body
        console.log("quess start")
        console.log(obj.tweet.handle)
        answer = obj.tweet.word
        console.log(answer)
        let buttons  = document.getElementById("answerButtons")
        buttons.innerHTML = ""
        let words = obj.tweet.possibilities.synonyms.slice(0,3)
        words = words + obj.tweet.possibilities.antonyms.slice(0,3)
        words.add(answer)
        words = shuffle(words);
        words.forEach(function (element) {
            var btn = document.createElement("BUTTON");        // Create a <button> element
            var t = document.createTextNode(element);       // Create a text node
            btn.appendChild(t);                                // Append the text to <button>
            document.body.appendChild(btn);
            btn.classList.toggle("button2");
            btn.onclick = function(){
                answerQuestion(element,btn)
            };
            buttons.appendChild(btn)
        })
        document.getElementById("date").innerText = obj.tweet.timestamp
    }
    /**----------------------------------------------**/
    else if (obj.response === "userinfo") {


            console.log("correct")
            let handle = document.getElementById("twitterAccount").value;
            console.log(handle)
            console.log(obj)
            let tweets = obj.user.recent_tweets
            addHandle(handle, obj.user.tweet_count,obj.user.follower_count,tweets)


    }
    else if (obj.response === "error") {
        window.alert(obj.human_readable_error + " : " + obj.error);
    }
}
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
function play() {
    if(document.getElementById("fs").checked) {

        if (handles.length > 1) {
            document.getElementById("FirstPage").style.display = "none";
            document.getElementById("SecondPage").style.display = "";
            //getQuestion()
            chooseRandom()
        } else {
            window.alert("You need to add at least 2 twitter accounts");
        }
    }else{
        document.getElementById("FirstPage").style.display = "none";
        document.getElementById("SecondPage").style.display = "";
        getQuestion()
    }

}
function guess(){
    let rnd = Math.floor(Math.random() * handles.length);
    let request = "blank"
     let handle= handles[rnd]
    let message = {request,handle };
    console.log(message)
    sendMessage(JSON.stringify(message));
}
function getQuestion(){
    guess()


}
function answerQuestion(userAnswer,btn) {
    if(answer === userAnswer ){

        btn.classList.toggle("button");
        //guess()
        $("#question").animate({width:'toggle'},500);
        $("#question").delay(300).animate({width:'toggle'},700);
        //$("#question").show("slide", { direction: "left" }, 1000);
        chooseRandom()
    }else{
        btn.classList.add("deleteButton","drop");
        btn.onclick = function(){
        };
    }
}
let dictTweets = []
function addJson(handler,tweets){
    dictTweets[handler] = tweets
}
let errorCount = 0
function chooseRandom(){
    let rnd = Math.floor(Math.random() * handles.length);
    if(dictTweets[handles[rnd]].length > 0){
        let rnd2 = Math.floor(Math.random() * dictTweets[handles[rnd]].length)
        let tweet = dictTweets[handles[rnd]][rnd2]
        let tweetText= document.getElementById("TweetText")
        tweetText.innerText = tweet.body
        console.log("quess start")
        console.log(tweet.handle)
        answer = tweet.handle
        console.log(answer)
        let buttons  = document.getElementById("answerButtons")
        buttons.innerHTML = ""
        handles.forEach(function (element) {
            var btn = document.createElement("BUTTON");        // Create a <button> element
            var t = document.createTextNode(element);       // Create a text node
            btn.appendChild(t);                                // Append the text to <button>
            document.body.appendChild(btn);
            btn.classList.toggle("button2");
            btn.onclick = function(){
                answerQuestion(element,btn)
            };
            buttons.appendChild(btn)
        })
        document.getElementById("date").innerText = tweet.timestamp
        var index = rnd2
        if (index > -1) {
            dictTweets[handles[rnd]].splice(index, 1);
        }
    }
    else if(errorCount > 100){
        alert("sorry but all of the tweets finished")
        location.reload();
    }
    else{
        errorCount++
        chooseRandom()
    }
}

