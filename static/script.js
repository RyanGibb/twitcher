
async function post(url, data) {
    console.log('-> tx ', data)
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    console.log(res)
    const recieved_data = await res.json()
    console.log('<- rx ', recieved_data)
    if (!res.ok) {
        alert(recieved_data.error)
        throw recieved_data.error
    }
    return recieved_data
}

const users = {}
const tweets = {}
const minGuessWhoUsers = 2
const minCompleteTheTweetUsers = 1

async function addUser() {
    const handle = document.getElementById('handle_input').value
    document.getElementById('handle_input').value = ''
    if (handle.charAt(0) === '@') {
      handle = handle.substr(1);
    }
    const user = await post('/userinfo', {handle})
    users[handle] = user
    refreshTable()
}

function removeUser(handle){
    delete users[handle]
    refreshTable()
}

function refreshTable(){
    refreshPlayButton()
    const table = document.getElementById('account_table')
    const handles = Object.keys(users)
    if (handles.length == 0) {
        table.style.display = 'none'
    } else {
        table.style.display = ''
    }
    const old_tbody = table.getElementsByTagName('tbody')
    const new_tbody = document.createElement('tbody')
    handles.forEach(handle => {
        const row = new_tbody.insertRow(0)
        const cell0 = row.insertCell(0)
        const cell1 = row.insertCell(1)
        const cell2 = row.insertCell(2)
        const cell3 = row.insertCell(3)
        const cell4 = row.insertCell(4)
        const user = users[handle]
        const profile_image = document.createElement('IMG')
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

function refreshPlayButton() {
    const play_button = document.getElementById('play_button')
    let minUsers
    if (document.getElementById('fs').checked) {
        minUsers = minGuessWhoUsers
    } else {
        minUsers = minCompleteTheTweetUsers
    }
    const handles = Object.keys(users)
    play_button.disabled = handles.length < minUsers
    play_button.title = 'Please add at least ' + minUsers + ' twitter account' +
        (minUsers == 1 ? "" : "s") + ' to play'
}

function play() {
    if (document.getElementById('fs').checked) {
        guessWho()
    }
    else{
        completeTheTweet()
    }
}

var displayTweet = () => { throw 'displayTweet not set' }

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
        const tweetText = document.getElementById('TweetText')
        tweetText.innerText = tweet.body.replace(correct_answer, '-----')
        const buttons = document.getElementById('answer_buttons')
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
            const btn = document.createElement('BUTTON')
            const t = document.createTextNode(word)
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
    const handles = Object.keys(users)
    const handle = handles[handles.length * Math.random() << 0];
    if (tweets[handle].length < 1) {
        alert(handle + ' has no more tweets.')
        location.reload()
        return
    }
    const index = Math.floor(Math.random() * tweets[handle].length)
    const tweet = tweets[handle][index]
    displayTweet(handle, tweet)
    tweets[handle].splice(index, 1)
}

var correct_answer = ''
var correct_handle = ''
function processAnswer(input_answer, btn) {
    if (correct_answer === input_answer) {
        btn.classList.toggle('button-default')
        btn.classList.add('button-correct')
        const name = document.getElementById('handle')
        name.innerHTML = '@' + correct_handle
        const profilePic = document.getElementById('avatar')
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
        const recent_tweets = await post(url, {handle})
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
    refreshPlayButton()
    const audio = document.getElementById('audio')
    changeVolume()
    audio.play()
}

var volume = 3
var maxVolume = 4
function changeVolume() {
    volume = (volume + 1) % maxVolume
    fractionalVolume = 1 - log(maxVolume - volume, maxVolume)
    const audio = document.getElementById('audio')
    audio.volume = fractionalVolume
    const audio_icon = document.getElementById('audio_icon')
    audio_icon.src = 'resources/volume' + volume + '.png'
}

function log(val, base) {
    return Math.log(val) / Math.log(base);
}
