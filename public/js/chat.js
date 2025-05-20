import { createPopup } from 'https://cdn.skypack.dev/@picmo/popup-picker';
import { uploadVideo } from './uploadvideo.js';
import { showMessages } from './showMessages.js';
import { showingMediaMessage } from './showingMediaMessage.js';


const socket = io();
const username = localStorage.getItem("username");
const roomId = localStorage.getItem('roomId')
const user = { username, roomId }

//to convert files(image video to base64 string of asci char)
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
    fileElement.value = ''
    toBase64(file).then((fileUrl) => {
        let VideoUrl
        if (fileUrl.includes('video')) {
            VideoUrl = fileUrl
            uploadVideo(VideoUrl, timestamp, username, socket)
        }
        const input = document.querySelector(".message-input");

        if (fileUrl.includes('image')) {
            const messagePayload = {
                timestamp, username, fileUrl
            }
            if (input.value) {
                messagePayload.messageText = input.value
                input.value = ''
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
            if (msg.status !== "delivered" && msg.status !== "seen" && msg.username !== username) {
                socket.emit('message_delivered', { messageId: msg._id, senderName: msg.username })
                msg.status === 'delivered'
            }
            if (msg.messageText && !msg.media_id) {
                showMessages(msg, msg, socket, username)
            }
            if (msg.media_id) {
                showingMediaMessage(msg.media_id.url, msg, msg, socket, username)
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

socket.on("chat message", ({ msg, message }) => {
    if (!msg.fileUrl) {
        if (msg, message) {
            showMessages(msg, message, socket, username)
        }
    } else if (msg.fileUrl) {
        showingMediaMessage(msg.fileUrl, msg, message, socket, username)
    }
});
//showing user messages to others
socket.on("chat message_all", ({ msg, message }) => {
    message.status = 'delivered'
    socket.emit('message_delivered', { messageId: message._id, senderName: message.username })
    if (!msg.fileUrl) {
        showMessages(msg, message, socket, username)
        // socket.emit('message_delivered', { messageId: message._id })
    } else if (msg.fileUrl) {
        showingMediaMessage(msg.fileUrl, msg, message, socket, username)
        // socket.emit('message_delivered', { messageId: message._id })

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
                li.classList += ' onlineUserList'
                li.innerHTML = `${element} <span class="dot"></span>`
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
    setTimeout(() => { outerDiv.remove() }, 1000)


    onlineUser(data)
    // Toastify({
    //     text: `${data.username} Joined`,
    //     duration: 5000,
    //     destination: "https://github.com/apvarun/toastify-js",
    //     newWindow: true,
    //     close: true,
    //     gravity: "top",
    //     position: "right",
    //     stopOnFocus: true,
    //     style: {
    //         background: "linear-gradient(to right, #00b09b, #96c93d)",
    //     },
    //     onClick: function () { } // Callback after click
    // }).showToast();
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
    // Toastify({
    //     text: `${data.username} Left`,
    //     duration: 3000,
    //     destination: "https://github.com/apvarun/toastify-js",
    //     newWindow: true,
    //     close: true,
    //     gravity: "top",
    //     position: "right",
    //     stopOnFocus: true,
    //     style: {
    //         background: "linear-gradient(to right, #00b09b, #96c93d)",
    //     },
    //     onClick: function () { } // Callback after click
    // }).showToast();
});
//emoji picker
emojiPicker(createPopup)
function emojiPicker(createPopup) {
    const selectionEmoji = document.querySelector("#selection-emoji")
    const inputMessage = document.querySelector('.message-input')
    const picker = createPopup({
        emojiSize: '28px',
        hideOnEmojiSelect: false
    },
        {
            referenceElement: selectionEmoji,
            triggerElement: selectionEmoji,
            position: "bottom-start",
            showCloseButton: true,
        }
    );
    selectionEmoji.addEventListener('click', () => {
        picker.toggle();
    })
    picker.addEventListener('emoji:select', (selection) => {
        inputMessage.value += selection.emoji
    })
}

//theme toggle
document.addEventListener("DOMContentLoaded", () => {
    const html = document.querySelector('.html')
    const savedTheme = localStorage.getItem("theme") || "light";
    html.setAttribute("data-theme", savedTheme);
});

const themeButton = document.querySelector(".themeButton");
themeButton.addEventListener("click", () => {
    const html = document.querySelector(".html");
    let currentTheme = html.getAttribute("data-theme") || 'light';
    const newTheme = currentTheme === "light" ? "dark" : "light";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
});

socket.on('update message status', ({ messageId, status }) => {
    try {
        const statusSpan = document.getElementById(messageId);
        if (status === 'seen') {
            statusSpan.innerText = "✅"
        }
        if (status === 'delivered') {
            console.log('hitting delivered')
            statusSpan.innerText = "✓✓"
        }
    } catch (err) {
        console.error(err)
    }
})