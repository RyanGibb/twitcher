
async function post(url, data) {
    console.log('-> tx ', data)
    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    console.log(res)
    let recieved_data = await res.json()
    console.log('<- rx ', recieved_data)
    if (!res.ok) {
        alert(recieved_data.error)
        throw recieved_data.error
    }
    return recieved_data
}

let users = {}
let tweets = {}
const minUsers = 2

async function addUser() {
    let handle = document.getElementById('handle_input').value
    document.getElementById('handle_input').value = ""
    if (handle.charAt(0) === '@') {
      handle = handle.substr(1);
    }
    let user = await post('/userinfo', {handle})
    users[handle] = user
    refreshTable()
}

function removeUser(handle){
    delete users[handle]
    refreshTable()
}

function refreshTable(){
    let table = document.getElementById('account_table')
    let play_button = document.getElementById('play_button')
    let handles = Object.keys(users)
    if (handles.length == 0) {
        table.style.display = 'none'
    } else {
        table.style.display = ''
    }
    play_button.disabled = handles.length < minUsers
    let old_tbody = table.getElementsByTagName('tbody')
    var new_tbody = document.createElement('tbody')
    handles.forEach(handle => {
        const row = new_tbody.insertRow(0)
        const cell0 = row.insertCell(0)
        const cell1 = row.insertCell(1)
        const cell2 = row.insertCell(2)
        const cell3 = row.insertCell(3)
        const cell4 = row.insertCell(4)
        const user = users[handle]
        const profile_image = document.createElement("IMG")
        profile_image.src = user.profile_image_url
        cell0.appendChild(profile_image)
        cell1.innerHTML = '@' + handle
        cell2.innerHTML = user.tweet_count
        cell3.innerHTML = user.follower_count
        const button = document.createElement('button')
        button.classList.add('delete-button')
        button.onclick = () => removeUser(handle)
        button.innerText = 'Delete'
        cell4.appendChild(button)
    })
    table.replaceChild(new_tbody, old_tbody[0])
}

function play() {
    if (document.getElementById('fs').checked) {
        guessWho()
    }
    else{
        completeTheTweet()
    }
}

var displayTweet = () => { throw "displayTweet not set" }

async function guessWho() {
    if (users.length <= 1) {
        window.alert('You need to add at least 2 twitter handles')
        return
    }
    document.getElementById('mode_title').innerHTML = 'Guess Who?'
    if (!await getTweets('/recentTweets')) { return }
    displayTweet = (tweet_handle, tweet) => {
        document.getElementById('TweetText').innerText = tweet.body
        document.getElementById('date').innerText = tweet.timestamp
        correct_handle = tweet_handle
        correct_answer = tweet_handle
        const buttons = document.getElementById('answer_buttons')
        buttons.innerHTML = ''
        for (const handle in users) {
            const btn = document.createElement('BUTTON')
            const text = document.createTextNode('@' + handle)
            btn.appendChild(text)
            document.body.appendChild(btn)
            btn.classList.add('button', 'button-default')
            btn.onclick = () => processAnswer(handle, btn)
            buttons.appendChild(btn)
        }
    }
    chooseTweet()
    document.getElementById('first_page').style.display = 'none'
    document.getElementById('second_page').style.display = ''
}

async function completeTheTweet() {
    document.getElementById('mode_title').innerHTML = 'Complete The Tweet!!!'
    if (!await getTweets('/recentTweetsBlanked')) { return }
    displayTweet = (tweet_handle, tweet) => {
        correct_handle = tweet_handle
        correct_answer = tweet.word
        let tweetText = document.getElementById('TweetText')
        tweetText.innerText = tweet.body.replace(correct_answer, '-----')
        let buttons = document.getElementById('answer_buttons')
        buttons.innerHTML = ''
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
        words = words.concat(correct_answer)
        words.forEach(word => {
            var btn = document.createElement('BUTTON')
            var t = document.createTextNode(word)
            btn.appendChild(t)
            document.body.appendChild(btn)
            btn.classList.add('button', 'button-default')
            btn.onclick = () => processAnswer(word, btn)
            buttons.appendChild(btn)
        })
        document.getElementById('date').innerText = tweet.timestamp
    }
    chooseTweet()
    document.getElementById('first_page').style.display = 'none'
    document.getElementById('second_page').style.display = ''
}

function chooseTweet(){
    var handles = Object.keys(users)
    const handle = handles[handles.length * Math.random() << 0];
    if (tweets[handle].length < 1) {
        alert(handle + ' has no more tweets.')
        location.reload()
        return
    }
    const index = Math.floor(Math.random() * tweets[handle].length)
    let tweet = tweets[handle][index]
    displayTweet(handle, tweet)
    tweets[handle].splice(index, 1)
}

var correct_answer = ''
var correct_handle = ''
function processAnswer(input_answer, btn) {
    if (correct_answer === input_answer) {
        btn.classList.toggle('button-default')
        btn.classList.add('button-correct')
        let name = document.getElementById('handle')
        name.innerHTML = '@' + correct_handle
        let profilePic = document.getElementById('avatar')
        profilePic.src = users[correct_handle].profile_image_url
        setTimeout(() => {
            profilePic.src = 'resources/logo1.jpg'
            name.innerHTML = '@?'
        }, 1000)
        setTimeout(() => chooseTweet(), 1000)
    } else{
        btn.classList.toggle('button-default')
        btn.classList.add('button-incorrect')
    }
}

async function getTweets(url) {
    let ok = true
    for (const handle in users) {
        let recent_tweets = await post(url, {handle})
        if (recent_tweets < 0) {
            alert(handle + ' has no tweets')
            removeUser(handle)
            ok = false
        } else {
            tweets[handle] = recent_tweets
        }
    }
    return ok
}

function setup() {
    var audio = document.getElementById("audio")
    changeVolume()
    audio.play()
}

var volume = 0
var maxVolume = 4
function changeVolume() {
    volume = (volume + 1) % maxVolume
    fractionalVolume = 1 - log(maxVolume - volume, maxVolume)
    var audio = document.getElementById("audio")
    audio.volume = fractionalVolume
    var audio_icon = document.getElementById("audio_icon")
    audio_icon.src = 'resources/volume' + volume + '.png'
}

function log(val, base) {
    return Math.log(val) / Math.log(base);
}
