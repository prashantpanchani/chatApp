module.exports = function showMessages(msg, message) {
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