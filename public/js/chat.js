
const socket = io();
const username = localStorage.getItem("username");
const roomId = localStorage.getItem('roomId')
const user = { username, roomId }
socket.emit('initiateChat', user)

//showing username
const sidebarHeader = document.querySelector(".sidebar-header");
const usernamePar = document.createElement("p");
usernamePar.innerText = "username :" + (username ?? 'Guest');
sidebarHeader.appendChild(usernamePar)

socket.on('previousMessage', (messages) => {
    const messageArea = document.querySelector(".message-area");
    messageArea.scrollTop = messageArea.scrollHeight;
    messages.forEach(msg => {
        const outerDiv = document.createElement("div");
        const messagePar = document.createElement("p");
        const timeSpan = document.createElement("span");

        outerDiv.style.margin = "1%";
        outerDiv.style.padding = "2%";
        outerDiv.style.backgroundColor = "#bab5b5";
        outerDiv.style.borderRadius = "0.7em";
        outerDiv.style.wordWrap = "break-word"
        messagePar.style.margin = "auto";

        messagePar.innerText = msg.username + " : " + msg.messageText;
        timeSpan.innerText = msg.timestamp;

        outerDiv.appendChild(messagePar);
        outerDiv.appendChild(timeSpan);
        messageArea.appendChild(outerDiv);
    })
})

const messageForm = document.querySelector("#messageForm")
messageForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const input = document.querySelector(".message-input");
    if (input.value) {
        const timestamp = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        socket.emit("chat message", {
            message: input.value,
            timestamp,
            username,
        });
        input.value = "";
    }
});

//showing user messages
socket.on("chat message", (msg) => {

    const messageArea = document.querySelector(".message-area");
    const outerDiv = document.createElement("div");
    const messagePar = document.createElement("p");
    const timeSpan = document.createElement("span");

    outerDiv.style.margin = "1%";
    outerDiv.style.padding = "2%";
    outerDiv.style.backgroundColor = "#bab5b5";
    outerDiv.style.borderRadius = "0.7em";
    outerDiv.style.wordWrap = "break-word"
    messagePar.style.margin = "auto";

    messagePar.innerText = msg.username + " : " + msg.message;
    timeSpan.innerText = msg.timestamp;

    outerDiv.appendChild(messagePar);
    outerDiv.appendChild(timeSpan);
    messageArea.appendChild(outerDiv);
});

//typing indicator
const input = document.querySelector(".message-input");
input.addEventListener('focus', () => {
    socket.emit('user input', { username, typing: true })
})
input.addEventListener('blur', () => {
    socket.emit('user input', { username, typing: false })
})
socket.on('user_typing_status', (data) => {
    const { username: typingUsername, typing } = data
    const p = document.querySelector('.indicator-p');
    if (typing && typingUsername !== username) {
        p.innerText = `${typingUsername} is Typing...`
    } else {
        p.innerText = ''
    }
})

let ul = document.querySelector('.sidebar-ul')
ul.style.marginTop = "1%"
ul.style.listStyleType = 'none'

function onlineUser(data) {
    ul.innerHTML = ""
    const userList = data.userList
    userList.forEach(element => {
        if (element !== username) {
            let li = document.createElement('li')
            li.innerHTML = `${element}`
            ul.append(li)

        }
    });




}
//new user notification and onlines users
socket.on("new_user_connected", (data) => {
    const messageArea = document.querySelector(".message-area");
    const outerDiv = document.createElement("div");
    const messagePar = document.createElement("p");

    outerDiv.style.margin = "1%";
    outerDiv.style.padding = "2%";
    outerDiv.style.backgroundColor = "#bab5b5";
    outerDiv.style.borderRadius = "0.7em";

    messagePar.innerText = `${data.username} Joined chat`
    outerDiv.append(messagePar)
    messageArea.append(outerDiv)
    setTimeout(() => { outerDiv.remove() }, 3000)


    onlineUser(data)
    Toastify({
        text: `${data.username} Joined`,
        duration: 5000,
        destination: "https://github.com/apvarun/toastify-js",
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
        onClick: function () { } // Callback after click
    }).showToast();
    console.log(`${localStorage.getItem("username")} connected `);
});

//
socket.on('online user', (data) => {
    onlineUser(data)
})

//user disconnection notification and online users
socket.on("user_disconnected", (data) => {
    const messageArea = document.querySelector(".message-area");
    const outerDiv = document.createElement("div");
    const messagePar = document.createElement("p");

    outerDiv.style.margin = "1%";
    outerDiv.style.padding = "2%";
    outerDiv.style.backgroundColor = "#bab5b5";
    outerDiv.style.borderRadius = "0.7em";

    messagePar.innerText = `${data.username} Left chat`
    outerDiv.append(messagePar)
    messageArea.append(outerDiv)
    setTimeout(() => { outerDiv.remove() }, 3000)
    onlineUser(data)

    Toastify({
        text: `${data.username} Left`,
        duration: 3000,
        destination: "https://github.com/apvarun/toastify-js",
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
        onClick: function () { } // Callback after click
    }).showToast();
});
