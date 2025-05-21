const reactionEmojis = ['👍🏻', '❤️', '😆', '😯', '🔥']
function createReactionButtons(messageDiv, messageId, socket, username) {
    const reactionsDiv = document.createElement('div')
    reactionsDiv.className = 'message-reactions'
    reactionEmojis.forEach((emoji) => {
        const button = document.createElement('button')
        button.className = 'reaction-button'
        button.textContent = emoji
        button.onclick = () => {
            toggleReaction(messageId, emoji, socket, username)
        }
        reactionsDiv.appendChild(button)
    })
    messageDiv.appendChild(reactionsDiv)
}
function toggleReaction(messageId, emoji, socket, username) {
    socket.emit('toggle reaction', { messageId, emoji, username })
}

function displayReactions(messageDiv, reactions, socket, username) {
    const existingDisplay = messageDiv.querySelector('.reactions-display')
    if (existingDisplay) {
        existingDisplay.remove();
    }
    if (!reactions || Object.keys(reactions).length === 0) return
    const reactionsDisplay = document.createElement('div')
    reactionsDisplay.className = 'reactions-display'

    Object.entries(reactions).forEach(([emoji, users]) => {
        if (users.length === 0) return;
        const badge = document.createElement('div');
        badge.className = 'reaction-badge';
        if (users.includes(username)) {
            badge.classList.add('active')
        }
        const emojiSpan = document.createElement('span')
        emojiSpan.className = 'reaction-emoji'
        emojiSpan.textContent = emoji

        const countSpan = document.createElement('span')
        countSpan.className = 'reaction-count'
        countSpan.textContent = users.length

        badge.appendChild(emojiSpan)
        badge.appendChild(countSpan)
        badge.onclick = () => {
            toggleReaction(messageDiv.dataset.messageId, emoji, socket, username)
        }
        reactionsDisplay.appendChild(badge)
    })
    messageDiv.appendChild(reactionsDisplay)

}
function updateReaction(messageId, reaction, socket, username) {
    const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
    displayReactions(messageDiv, reaction, socket, username)
}
export { createReactionButtons, displayReactions, toggleReaction, updateReaction }