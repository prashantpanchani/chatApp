const socket = io();
const username = localStorage.getItem("username");
const roomId = localStorage.getItem('roomId')
const user = { username, roomId }

//to convert files(image video to )
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});


//file upload
const fileUploadButton = document.querySelector('.fileUploadButton')
fileUploadButton.addEventListener('click', () => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    const fileElement = document.querySelector('#fileElement')
    if (!fileElement.files[0]) {
        alert('Please Select File')
        return
    }
    const file = fileElement.files[0]
    toBase64(file).then((fileUrl) => {
        let VideoUrl
        if (fileUrl.includes('video')) {
            VideoUrl = fileUrl
            async function uploadVideo(VideoUrl) {
                const response = await fetch('https://api.cloudinary.com/v1_1/dhrebwfsi/video/upload', {
                    method: 'POST',
                    body: JSON.stringify({
                        file: VideoUrl,
                        upload_preset: "ml_default"
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                const data = await response.json()
                const input = document.querySelector(".message-input");
                const messagePayload = {
                    timestamp, username, fileUrl: data.url
                }
                if (input.value) {
                    messagePayload.messageText = input.value
                }
                socket.emit('media upload', { ...messagePayload })
            }
            uploadVideo(VideoUrl)
        }
        const input = document.querySelector(".message-input");
        if (fileUrl.includes('image')) {
            const messagePayload = {
                timestamp, username, fileUrl
            }
            if (input.value) {
                messagePayload.messageText = input.value
            }
            socket.emit('media upload', { ...messagePayload })
        }

    })
})
socket.emit('initiateChat', user)

//showing username
const sidebarHeader = document.querySelector(".sidebar-header");
const usernamePar = document.createElement("p");
usernamePar.innerText = "username :" + (username ?? 'Guest');
sidebarHeader.appendChild(usernamePar)

socket.emit('userJoin', user)

//showing previous messages
socket.on('previousMessage', (messages) => {
    const messageArea = document.querySelector(".message-area");
    if (messages) {
        messages.forEach(msg => {
            if (msg.messageText && !msg.media_id) {
                showMessages(msg, msg)
            }
            if (msg.media_id) {
                showingMediaMessage(msg.media_id.url, msg, msg)
            }
        })
        messageArea.scrollTop = messageArea.scrollHeight;
    }
})

const messageForm = document.querySelector("#messageForm")
messageForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const input = document.querySelector(".message-input");
    const fileElement = document.querySelector('#fileElement')
    if (!input.value) {
        alert('please Enter Message')
        return
    }
    if (input.value) {
        const timestamp = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        socket.emit("chat message", {
            messageText: input.value,
            timestamp,
            username,
        });
        input.value = "";
    }
});
//showing user messages
socket.on("chat message", ({ msg, message }) => {
    console.log("db is", message)
    if (!msg.fileUrl) {
        showMessages(msg, message)
    } else if (msg.fileUrl) {
        showingMediaMessage(msg.fileUrl, msg, message)
    }
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

function onlineUser(data) {
    if (ul) {
        ul.innerHTML = ""
    }
    const userList = data.userList
    if (userList) {
        userList.forEach(element => {
            if (element !== username) {
                let li = document.createElement('li')
                li.innerHTML = `${element}`
                ul.append(li)
            }
        });
    }
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
    messagePar.style.height = "10%"
    outerDiv.append(messagePar)
    messageArea.append(outerDiv)
    setTimeout(() => { outerDiv.remove() }, 10000)


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
    setTimeout(() => { outerDiv.remove() }, 1000)
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

function showMessages(msg, message) {
    const messageArea = document.querySelector(".message-area");
    const outerDiv = document.createElement("div");
    const secondOuterDiv = document.createElement('div')
    const messagePar = document.createElement("p");
    const timeSpan = document.createElement("span");
    outerDiv.className += " outerDivMessageArea"
    messagePar.className += " messageParMessageArea"
    messagePar.innerText = msg.username + " : " + msg.messageText;
    timeSpan.innerText = msg.timestamp;

    outerDiv.appendChild(messagePar);
    outerDiv.appendChild(timeSpan);
    if (msg.username === username) {
        const deleteButton = document.createElement('button')
        deleteButton.classList += " deleteButton"
        deleteButton.innerText = 'Delete'
        secondOuterDiv.append(deleteButton)
        //deleting message
        deleteButton.addEventListener('click', () => {
            socket.emit('delete message', message)
            outerDiv.remove()
        })
    }
    outerDiv.appendChild(secondOuterDiv)
    messageArea.appendChild(outerDiv);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function showingMediaMessage(url, msg, message) {

    const messageArea = document.querySelector('.message-area')
    const outerDiv = document.createElement("div")
    const firstDiv = document.createElement('div')
    const secondDiv = document.createElement('div')
    const messagePar = document.createElement("p");

    messagePar.style.margin = "auto"
    messagePar.style.paddingBottom = "5px"
    outerDiv.style.margin = "1%";
    outerDiv.style.padding = "2%";
    outerDiv.style.backgroundColor = "#bab5b5";
    outerDiv.style.borderRadius = "0.7em";
    const fileUrl = msg.fileUrl
    if (url.includes('video')) {
        firstDiv.innerHTML = `<video width="70%" height="80%" controls>
                                         <source src=${url} type="video/mp4">
                                     </video>`
        outerDiv.append(firstDiv)
    }
    if (url.includes('image')) {
        firstDiv.innerHTML = `<img src=${url} width="50%" height="50%">`
        outerDiv.append(firstDiv)
    }
    if (msg.messageText) {

        messagePar.innerText = msg.username + " : " + msg.messageText;
        secondDiv.appendChild(messagePar)
    }
    const timeSpan = document.createElement("span");
    timeSpan.innerText = msg.timestamp;
    secondDiv.appendChild(timeSpan)
    outerDiv.appendChild(firstDiv)
    outerDiv.appendChild(secondDiv)
    if (msg.username === username) {
        // console.log('showing media message', message)
        const deleteButton = document.createElement('button')
        deleteButton.classList += " deleteButton"
        deleteButton.innerText = 'Delete'
        secondDiv.append(deleteButton)

        deleteButton.addEventListener('click', () => {
            socket.emit('delete message', message)
            outerDiv.remove()
        })
    }
    messageArea.appendChild(outerDiv)
}