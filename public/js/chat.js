


const socket = io();
const username = localStorage.getItem("username");
const roomId = localStorage.getItem('roomId')
const user = { username, roomId }

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});


//file upload
const fileUploadButton = document.querySelector('.fileUploadButton')
fileUploadButton.addEventListener('click', () => {
    const fileElement = document.querySelector('#fileElement')
    const file = fileElement.files[0]
    toBase64(file).then((fileUrl) => {
        fetch('https://api.cloudinary.com/v1_1/dhrebwfsi/video/upload', {
            method: 'POST',
            body: JSON.stringify({
                file: fileUrl,
                upload_preset: "ml_default"
            }),
            headers: {
                "Content-Type": "application/json",
            },

        })
            .then((response) => response.json())
            .then((data) => {
                // const urlStr = data.url
                // console.log(urlStr)
                // const res = urlStr.includes('video/mp4')
                // if () {
                //     console.log('yup it is video of type mp4')
                // }
                const messageArea = document.querySelector('.message-area')
                const outerDiv = document.createElement("div")
                outerDiv.style.margin = "1%";
                outerDiv.style.padding = "2%";
                outerDiv.style.backgroundColor = "#bab5b5";
                outerDiv.style.borderRadius = "0.7em";
                // <embed type='video/mp4' src=${data.url} height=auto width=auto></embed>
                outerDiv.innerHTML = `<video width="320" height="240" controls>
                                            <source src=${data.url} type="video/mp4">
                                        </video>`
                messageArea.append(outerDiv)
            })
            .catch((error) => console.log(error))
    })
})

socket.emit('initiateChat', user)

//showing username
const sidebarHeader = document.querySelector(".sidebar-header");
const usernamePar = document.createElement("p");
usernamePar.innerText = "username :" + (username ?? 'Guest');
sidebarHeader.appendChild(usernamePar)

socket.emit('userJoin', user)

socket.on('previousMessage', (messages) => {
    const messageArea = document.querySelector(".message-area");
    if (messages) {
        messages.forEach(msg => {
            showMessages(msg)
            // const outerDiv = document.createElement("div");
            // const messagePar = document.createElement("p");
            // const timeSpan = document.createElement("span");
            // outerDiv.className += " outerDivMessageArea"
            // messagePar.className += " messageParMessageArea"

            // // outerDiv.style.margin = "1%";
            // // outerDiv.style.padding = "2%";
            // // outerDiv.style.backgroundColor = "#bab5b5";
            // // outerDiv.style.borderRadius = "0.7em";
            // // outerDiv.style.wordWrap = "break-word"
            // // messagePar.style.margin = "auto";

            // messagePar.innerText = msg.username + " : " + msg.messageText;
            // timeSpan.innerText = msg.timestamp;

            // outerDiv.appendChild(messagePar);
            // outerDiv.appendChild(timeSpan);
            // messageArea.appendChild(outerDiv);
        })
        messageArea.scrollTop = messageArea.scrollHeight;

    }

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
            messageText: input.value,
            timestamp,
            username,
        });
        input.value = "";
    }
});

//showing user messages
socket.on("chat message", (msg) => {
    showMessages(msg)
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

function showMessages(msg) {
    const messageArea = document.querySelector(".message-area");
    const outerDiv = document.createElement("div");
    const messagePar = document.createElement("p");
    const timeSpan = document.createElement("span");
    outerDiv.className += " outerDivMessageArea"
    messagePar.className += " messageParMessageArea"

    // outerDiv.style.margin = "1%";
    // outerDiv.style.padding = "2%";
    // outerDiv.style.backgroundColor = "#bab5b5";
    // outerDiv.style.borderRadius = "0.7em";
    // outerDiv.style.wordWrap = "break-word"
    // messagePar.style.margin = "auto";

    messagePar.innerText = msg.username + " : " + msg.messageText;
    timeSpan.innerText = msg.timestamp;

    outerDiv.appendChild(messagePar);
    outerDiv.appendChild(timeSpan);
    messageArea.appendChild(outerDiv);
    messageArea.scrollTop = messageArea.scrollHeight;
}