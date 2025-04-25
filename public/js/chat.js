
const socket = io("ws://localhost:3000");


const sidebarHeader = document.querySelector(".sidebar-header");
const usernamePar = document.createElement("p");
const username = localStorage.getItem("username");
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

socket.on("connect", (socket) => {
    console.log(`${localStorage.getItem("username")} connected `);
});
socket.on("disconnect", () => { });
