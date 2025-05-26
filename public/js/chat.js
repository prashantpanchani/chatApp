import { createPopup } from 'https://cdn.skypack.dev/@picmo/popup-picker';
import { uploadVideo } from './uploadvideo.js';
import { showMessages } from './showMessages.js';
import { showingMediaMessage } from './showingMediaMessage.js';
import { updateReaction } from './reactions.js';

console.log("username:", localStorage.getItem("username"));
console.log("roomId:", localStorage.getItem("roomId"));

const socket = io();
const username = localStorage.getItem("username");
const roomId = localStorage.getItem('roomId')
const user = { username, roomId }

console.log(username)
if (!username || !roomId) {
    console.log('if check working')
    setTimeout(() => {
        window.location.href = "/";
    }, 1000)
}

//to convert files(image video to base64 string of asci char)
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});


//file upload


socket.emit('initiateChat', user)

//showing username
const sidebarHeader = document.querySelector(".sidebar-header");
const usernamePar = document.createElement("p");
usernamePar.innerText = "username : " + (username ?? 'Guest') + ' | room :' + roomId;
sidebarHeader.appendChild(usernamePar)

socket.emit('userJoin', user)

//showing previous messages
socket.on('previousMessage', (messages) => {
    const messageArea = document.querySelector(".message-area");
    if (messages) {
        messages.forEach(msg => {
            if (msg.status !== "delivered" && msg.status !== "seen" && msg.username !== username) {
                socket.emit('message_delivered', { messageId: msg._id, senderName: msg.username })
                // msg.status === 'delivered'
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


const fileUploadEmojiButton = document.querySelector("#section-file")
const fileElement = document.querySelector("#fileElement")
fileUploadEmojiButton.onclick = () => {
    fileElement.click()
}
const messageForm = document.querySelector("#messageForm")
messageForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const input = document.querySelector(".message-input");
    const messageValue = input.value
    const fileElement = document.querySelector('#fileElement')
    const file = fileElement.files[0]
    if (file) {
        fileElement.value = ''
        toBase64(file).then((fileUrl) => {
            const timestamp = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
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
    }

    if (!input.value) {
        alert('please Enter Message')
        return
    }
    if (input.value && !file) {
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
        input.value = " ";
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
    } else if (msg.fileUrl) {
        showingMediaMessage(msg.fileUrl, msg, message, socket, username)
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
        ul.innerHTML = "<li>Online Users :</li>"
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
    outerDiv.className = "outerDivMessageArea"


    messagePar.innerText = `${data.username} Joined The Chat`
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
    outerDiv.className = "outerDivMessageArea"

    messagePar.innerText = `${data.username} Left The Chat`
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
            position: "bottom-end",
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
themeButton.innerText = "🌞"
themeButton.addEventListener("click", () => {
    const html = document.querySelector(".html");
    let currentTheme = html.getAttribute("data-theme") || 'light';
    const newTheme = currentTheme === "light" ? "dark" : "light";
    newTheme === "light" ? themeButton.textContent = "🌞" : themeButton.textContent = "🌙"
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
});

socket.on('update_message_status', ({ messageId, status }) => {
    try {
        const statusSpan = document.getElementById(messageId);
        if (statusSpan) {
            if (status === 'seen') {
                statusSpan.innerText = "✅"
            }
            else if (status === 'delivered') {
                statusSpan.innerText = "✓✓"
            } else if (status === 'sent') {
                statusSpan.innerText === "✓"
            }
        }
    } catch (err) {
        console.error(err)
    }
})

socket.on('reaction updated', ({ messageId, reactions }) => {
    updateReaction(messageId, reactions, socket, username)
})