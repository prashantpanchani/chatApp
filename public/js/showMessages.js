import { createReactionButtons, displayReactions } from "./reactions.js";
export function showMessages(msg, message, socket, username) {
    const messageArea = document.querySelector(".message-area");
    const outerDiv = document.createElement("div");
    const secondOuterDiv = document.createElement('div')
    const messagePar = document.createElement("p");
    const timeSpan = document.createElement("span");

    outerDiv.dataset.messageId = message._id
    // outerDiv.id = message._id
    // outerDiv.setAttribute('id', String(message._id))
    outerDiv.className = "outerDivMessageArea"
    outerDiv.style.position = 'relative'
    messagePar.className += " messageParMessageArea"
    messagePar.innerText = msg.username + " : " + msg.messageText;
    timeSpan.innerText = msg.timestamp;
    timeSpan.style.fontSize = "10px"


    outerDiv.appendChild(messagePar);
    outerDiv.appendChild(timeSpan);

    secondOuterDiv.className = 'delete_status'
    secondOuterDiv.style.display = 'inline-flex'
    secondOuterDiv.style.alignItems = 'center'
    secondOuterDiv.style.position = 'absolute'
    secondOuterDiv.style.right = '20px'
    secondOuterDiv.style.bottom = '5px'

    if (msg.username === username) {
        outerDiv.style.marginLeft = "auto";
        outerDiv.style.marginRight = "1%";
        outerDiv.style.backgroundColor = "#82abf8"
        outerDiv.style.color = "white"

        const deleteButton = document.createElement('button')
        deleteButton.classList += "deleteButton"
        deleteButton.innerText = '🗑️'
        secondOuterDiv.append(deleteButton)

        const statusSpan = document.createElement('span');
        statusSpan.className = "message-status";
        statusSpan.id = message._id

        if (message.status === 'sent') {
            statusSpan.innerText = "✓";
        }
        if (message.status === 'delivered') {
            statusSpan.innerText = "✓✓";
        }
        if (message.status === 'seen') {
            statusSpan.innerText = "✅";
        }
        statusSpan.style.marginLeft = "5%"
        secondOuterDiv.appendChild(statusSpan);
        //deleting message
        deleteButton.addEventListener('click', () => {
            socket.emit('delete message', message)
            outerDiv.remove()
        })

    } else {
        outerDiv.style.marginRight = "auto";
        outerDiv.style.marginLeft = "1%";
        outerDiv.style.width = "60%";
    }
    outerDiv.appendChild(secondOuterDiv)
    messageArea.appendChild(outerDiv);
    if (message.username !== username && message.status !== "seen") {
        socket.emit('message_seen', { messageId: message._id, senderName: message.username });
    }
    createReactionButtons(outerDiv, message._id, socket, username)
    displayReactions(outerDiv, message.reactions, socket, username)

    messageArea.scrollTop = messageArea.scrollHeight;
}