
module.exports = function emojiPicker(createPopup) {
    const selectionEmoji = document.querySelector("#selection-emoji")
    const inputMessage = document.querySelector('.message-input')
    const picker = createPopup(
        {},
        {
            referenceElement: selectionEmoji,
            triggerElement: selectionEmoji,
            position: "bottom-start",
            showCloseButton: true
        }
    );
    selectionEmoji.addEventListener('click', () => {
        picker.toggle();
    })
    picker.addEventListener('emoji:select', (selection) => {
        inputMessage.value += selection.emoji
    })
}