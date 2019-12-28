
async function post(url, data) {
    console.log("-> tx ", data)
    let res = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    let recieved_data = await res.json()
    console.log("<- rx ", recieved_data)
    if (!res.ok) {
        console.log("Recieved error.")
        throw recieved_data
    }
    return recieved_data
}

var users = []
const minUsers = 2

async function addUser() {
    let handle = document.getElementById("twitterAccount").value
    let user = await post("/userinfo", {handle})
    if (user.recent_tweets <= 0) {
        window.alert(handle + ' has no recent tweets')
        return
    }
    if (users.some(u => u.handle === handle)) {
        window.alert("User already exist")
        return
    }
    users.push(user)
    refreshTable()
}

function removeUser(handle){
    users.splice(users.findIndex(user => user.handle === handle))
    refreshTable()
}

function refreshTable(){
    let table = document.getElementById("UserList")
    let tabledisplay = document.getElementById("UserListTotal")
    let infoText = document.getElementById("infoText")
    let playButton = document.getElementById("playButton")
    if (users.length == 0) {
        table.style.display = "none"
        tabledisplay.style.display = "none"
    } else {
        table.style.display = ""
        tabledisplay.style.display = ""
    }
    if (users.length < minUsers) {
        infoText.style.display = ""
        playButton.disabled = true
    } else{
        infoText.style.display = "none"
        playButton.disabled = false
    }
    let old_tbody = table.getElementsByTagName('tbody')
    var new_tbody = document.createElement('tbody')
    let count = 1
    users.forEach(user => {
        let row = new_tbody.insertRow(0)
        let cell0 = row.insertCell(0)
        let cell1 = row.insertCell(1)
        let cell2 = row.insertCell(2)
        let cell3 = row.insertCell(3)
        let cell4 = row.insertCell(4)
        cell0.innerHTML = count
        cell1.innerHTML = user.handle
        cell2.innerHTML = user.tweet_count
        cell3.innerHTML = user.follower_count
        cell4.innerHTML = "<button class=\"deleteButton\"  onclick='removeUser(\"" + user.handle + "\")'>Delete</button>"
        count++
    })
    table.replaceChild(new_tbody, old_tbody[0])
}

function play() {
    document.getElementById("FirstPage").style.display = "none"
    document.getElementById("SecondPage").style.display = ""
    if(document.getElementById("fs").checked) {
        guessWho()
    }
    else{
        completeTheTweet()
    }
}

var answer = ""
function processAnswer(input_answer, btn) {
    if (answer === input_answer) {
        btn.classList.toggle("button")
        let name = document.getElementById("handle")
        name.innerHTML = "@"+answer
        name.style.color = "green"
        let user = users.find(user => user.handle === answer);
        let profilePic = document.getElementById("avatar")
        profilePic.src = user.profile_pic_url
        $("#question").delay(1500).animate({width:'toggle'},500)
        $("#question").delay(300).animate({width:'toggle'},700)

        setTimeout(function() {
            profilePic.src = "resources/logo1.jpg"
            name.style.color = "black"
            name.innerHTML = "@?????"
          }, 2000)
        
        let guessWho = document.getElementById("fs").checked
        setTimeout(() => {
          if (guessWho) {
            chooseTweet()
          }
          else {
            choseBlankedTweet()
          }
        }, 2000)
    } else{
        btn.classList.add("deleteButton","drop")
        btn.onclick = () => {}
    }
}

function guessWho() {
    if (users.length <= 1) {
        window.alert("You need to add at least 2 twitter handles")
        return
    }
    document.getElementById("mode-title").innerHTML = "Guess Who?"
    chooseTweet()
}

function chooseTweet(){
    const userIndex = Math.floor(Math.random() * users.length)
    const user = users[userIndex]
    if (user.recent_tweets.length < 1) {
        alert(user.handle + " has no more tweets.")
        location.reload()
        return
    }
    const tweetIndex = Math.floor(Math.random() * user.recent_tweets.length)
    let tweet = user.recent_tweets[tweetIndex]
    document.getElementById("TweetText").innerText = tweet.body
    document.getElementById("date").innerText = tweet.timestamp
    answer = tweet.handle
    let buttons  = document.getElementById("answerButtons")
    buttons.innerHTML = ""
    users.forEach(user => {
        var btn = document.createElement("BUTTON") 
        var text = document.createTextNode(user.handle)
        btn.appendChild(text)
        document.body.appendChild(btn)
        btn.classList.toggle("button2")
        btn.onclick = () => processAnswer(user.handle, btn)
        buttons.appendChild(btn)
    })
    users[userIndex].recent_tweets.splice(tweetIndex, 1)
}

function completeTheTweet() {
    document.getElementById("mode-title").innerHTML = "Complete The Tweet!!!"
    choseBlankedTweet()
}

async function choseBlankedTweet() {
    // TODO save blanked tweets by user when playing complete the tweet
    let user = users[Math.floor(Math.random() * users.length)]
    let recent_tweets = await post("/blank", {"handle": user.handle})
    let tweet = recent_tweets[Math.floor(Math.random() * recent_tweets.length)]
    answer = tweet.word
    let tweetText = document.getElementById("TweetText")
    tweetText.innerText = tweet.body.replace(answer, "-----")
    let buttons = document.getElementById("answerButtons")
    buttons.innerHTML = ""
    let words
    if(tweet.possibilities.synonyms.length > 3) {
        words = tweet.possibilities.synonyms.slice(0, 3)
    }else{
        words = tweet.possibilities.synonyms.slice(0, tweet.possibilities.synonyms.length)
    }
    if(tweet.possibilities.antonyms.length > 3) {
        words = words.concat(tweet.possibilities.antonyms.slice(0, 3))
    }else {
        words = words.concat(tweet.possibilities.antonyms.slice(0, tweet.possibilities.antonyms.length))
    }
    words = words.concat(answer)
    words.forEach(word => {
        var btn = document.createElement("BUTTON")
        var t = document.createTextNode(word)
        btn.appendChild(t)
        document.body.appendChild(btn)
        btn.classList.toggle("button2")
        btn.onclick = () => processAnswer(word, btn)
        buttons.appendChild(btn)
    })
    document.getElementById("date").innerText = tweet.timestamp
}
