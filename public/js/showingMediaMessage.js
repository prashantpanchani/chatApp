import { createReactionButtons, displayReactions } from "./reactions.js";

export function showingMediaMessage(url, msg, message, socket, username) {
    const messageArea = document.querySelector('.message-area')
    const outerDiv = document.createElement("div")
    const firstDiv = document.createElement('div')
    const secondDiv = document.createElement('div')
    const messagePar = document.createElement("p");

    outerDiv.dataset.messageId = message._id

    secondDiv.style.position = 'absolute'
    secondDiv.style.right = '20px'
    secondDiv.style.display = 'inline-flex'
    secondDiv.style.alignItems = 'center'
    secondDiv.style.bottom = '5px'

    // outerDiv.id = message._id
    outerDiv.className = 'outerDivMessageArea'
    outerDiv.style.position = 'relative'
    messagePar.style.margin = "auto"
    messagePar.style.paddingBottom = "5px"
    // outerDiv.style.margin = "1%";
    // outerDiv.style.padding = "2%";
    // outerDiv.style.backgroundColor = "#bab5b5";
    outerDiv.style.borderRadius = "0.7em";
    const fileUrl = msg.fileUrl
    if (url.includes('video')) {
        firstDiv.innerHTML = `<p>${msg.username} :</p><video width="70%" height="80%" controls>
                                         <source src=${url} type="video/mp4">
                                     </video>`
        outerDiv.append(firstDiv)
        messageArea.scrollTop = messageArea.scrollHeight;

    }
    if (url.includes('image')) {
        firstDiv.innerHTML = `<p>${msg.username} :</p><img src=${url} width="40%" height="40%">`
        outerDiv.append(firstDiv)
        messageArea.scrollTop = messageArea.scrollHeight;

    }
    if (msg.messageText) {
        messagePar.innerText = msg.messageText;
        firstDiv.appendChild(messagePar)
    }
    const timeSpan = document.createElement("span");
    timeSpan.style.fontSize = "10px"
    timeSpan.style.display = 'block'
    timeSpan.innerText = msg.timestamp;
    firstDiv.appendChild(timeSpan)
    outerDiv.appendChild(firstDiv)
    outerDiv.appendChild(secondDiv)




    //showing delete button for same username and message delivery indicator
    if (msg.username === username) {
        outerDiv.style.marginLeft = "auto";
        outerDiv.style.marginRight = "1%";
        outerDiv.style.backgroundColor = "#82abf8"
        outerDiv.style.color = "white"


        const deleteButton = document.createElement('button')
        deleteButton.classList += "deleteButton"
        deleteButton.innerText = '🗑️'
        secondDiv.append(deleteButton)

        deleteButton.addEventListener('click', () => {
            socket.emit('delete message', message)
            outerDiv.remove()
        })

        const statusSpan = document.createElement('span');
        statusSpan.className = "message-status";
        statusSpan.id = message._id
        if (message.status === 'sent') {
            statusSpan.innerText = "✓"; // 'sent'
        }
        if (message.status === 'delivered') {
            statusSpan.innerText = "✓✓"; // 'delivered'
        }
        if (message.status === 'seen') {
            statusSpan.innerText = "✅"; //'read'
        }
        statusSpan.style.marginLeft = "5%"
        secondDiv.appendChild(statusSpan);
    } else {
        outerDiv.style.marginRight = "auto";
        outerDiv.style.marginLeft = "1%";
        outerDiv.style.width = "60%";
    }
    messageArea.appendChild(outerDiv)
    if (message.username !== username && message.status !== "seen") {
        socket.emit('message_seen', { messageId: message._id, senderName: message.username });
    }
    createReactionButtons(outerDiv, message._id, socket, username)
    displayReactions(outerDiv, message.reactions, socket, username)
    messageArea.scrollTop = messageArea.scrollHeight;
}
