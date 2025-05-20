export function showMessages(msg, message, socket, username) {
    console.log("showMessages args:", { msg, message, socket, username });

    const messageArea = document.querySelector(".message-area");
    const outerDiv = document.createElement("div");
    const secondOuterDiv = document.createElement('div')
    const messagePar = document.createElement("p");
    const timeSpan = document.createElement("span");
    // outerDiv.id = message._id
    // outerDiv.setAttribute('id', String(message._id))
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

        const statusSpan = document.createElement('span');
        statusSpan.className = "message-status";
        statusSpan.id = message._id

        if (message.status === 'sent') {
            statusSpan.innerText = "✓"; // 'sent', 'delivered', or 'read'
        }
        if (message.status === 'delivered') {
            statusSpan.innerText = "✓✓"; // 'sent', 'delivered', or 'read'
        }
        if (message.status === 'seen') {
            statusSpan.innerText = "✅"; // 'sent', 'delivered', or 'read'
        }
        statusSpan.style.marginLeft = "35%"
        secondOuterDiv.appendChild(statusSpan);
        //deleting message
        deleteButton.addEventListener('click', () => {
            socket.emit('delete message', message)
            outerDiv.remove()
        })
    }
    outerDiv.appendChild(secondOuterDiv)
    messageArea.appendChild(outerDiv);
    if (message.username !== username && message.status !== "seen") {
        socket.emit('message_seen', { messageId: message._id, senderName: message.username });
    }
    messageArea.scrollTop = messageArea.scrollHeight;
}