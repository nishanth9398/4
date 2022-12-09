import util from "./util.js"
let userFriends, atualChat, interval, users = { [localStorage.getItem('id')]: { name: localStorage.getItem('name') } }

await fetch(`/api/social/friends/${localStorage.getItem('id')}`, { method: 'GET' }).then(async res => {
    if (res.ok) {
        userFriends = (await res.json()).friends

        for (let i = 0; i < userFriends.length; i++) {
            users[userFriends[i].id] = userFriends[i]

            const friendBox = document.createElement('div')
            friendBox.id = `friend-${i + 1}`
            friendBox.className = userFriends[i].id
            document.querySelector('#matchs').appendChild(friendBox)
            friendBox.addEventListener('click', openChat)

            const friendPhoto = document.createElement('img')
            friendPhoto.src = await util.getImg(userFriends[i].profilePhoto)
            friendBox.appendChild(friendPhoto)

            const friendName = document.createElement('p')
            friendName.innerText = `${userFriends[i].name} ${userFriends[i].lastname}`
            friendBox.appendChild(friendName)

            for (let index = 0; index < friendBox.children.length; index++) {
                friendBox.children[index].addEventListener('click', openChat)
                friendBox.children[index].className = userFriends[i].id
            }
        }
    } else {
        window.location.href = "../index.html"
    }
})

document.querySelector('button').addEventListener('click', async e => {
    if (document.querySelector('input').value) {
        await fetch(`/api/chat/message/${atualChat}`, {
            method: 'POST',
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify({
                email: localStorage.getItem('email'),
                pass: localStorage.getItem('pass'),
                content: document.querySelector('input').value
            })
        }).then(async res => {
            if (res.ok) {
                document.querySelector('input').value = ''
                displayChannel(await res.json())
            }
        })
    }
})

document.addEventListener('keydown', e => {
    if (e.key == 'Enter') document.querySelector('button').click()
})

/**
 * @param {MouseEvent} e 
 */
async function openChat(e) {
    atualChat = e.target.className
    clearInterval(interval)

    updateMessages()
    interval = setInterval(updateMessages, 500)

    async function updateMessages() {
        await fetch(`/api/chat/channel/${atualChat}`, {
            method: 'POST',
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify({
                email: localStorage.getItem('email'),
                pass: localStorage.getItem('pass'),
                length: document.querySelector('#mensagens').childElementCount
            })
        }).then(async res => {
            if (res.status == 202) {
                document.querySelector('div#sendMessage').style.display = 'block'
                displayChannel(await res.json())
            }
        })
    }
}

function displayChannel(channel) {
    const messagesDiv = document.querySelector('#mensagens')
    while (messagesDiv.firstChild) {
        messagesDiv.removeChild(messagesDiv.lastChild)
    }
    for (const msg of channel.messages) {
        const msgDiv = document.createElement('div')
        msgDiv.innerText = `${users[msg.owner].name}: ${msg.content}`
        messagesDiv.appendChild(msgDiv)
    }
}