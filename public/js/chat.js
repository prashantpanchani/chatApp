
const socket = io("ws://localhost:3000");
const username = localStorage.getItem("username");
socket.emit('set_username', username)

const sidebarHeader = document.querySelector(".sidebar-header");
const usernamePar = document.createElement("p");
usernamePar.innerText = "username :" + (username ?? 'Guest');
sidebarHeader.appendChild(usernamePar)

const sendButton = document.querySelector(".send-button");

sendButton.addEventListener("click", () => {
    const input = document.querySelector(".message-input");
    if (input.value) {
        const timestamp = new Date().toLocaleTimeString();
        socket.emit("chat message", {
            message: input.value,
            timestamp,
            username,
        });
        input.value = "";
    }
});
socket.on("chat message", (msg) => {
    console.log(msg);
    const messageArea = document.querySelector(".message-area");
    const outerDiv = document.createElement("div");
    const messagePar = document.createElement("p");
    const timeSpan = document.createElement("span");

    outerDiv.style.margin = "1%";
    outerDiv.style.padding = "2%";
    outerDiv.style.backgroundColor = "#bab5b5";
    outerDiv.style.borderRadius = "0.7em";
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




socket.on("new_user_connected", (data) => {
    Toastify({
        text: `${data.username} connected`,
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
socket.on("user_disconnected", (data) => {

    Toastify({
        text: `${data.username} disconnected`,
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
