export async function uploadVideo(VideoUrl, timestamp, username, socket) {
    const response = await fetch('https://api.cloudinary.com/v1_1/dhrebwfsi/video/upload', {
        method: 'POST',
        body: JSON.stringify({
            file: VideoUrl,
            upload_preset: "ml_default"
        }),
        headers: {
            "Content-Type": "application/json",
        },
    })
    const data = await response.json()
    const input = document.querySelector(".message-input");
    const messagePayload = {
        timestamp, username, fileUrl: data.url
    }
    if (input.value) {
        messagePayload.messageText = input.value
    }
    input.value = ''
    socket.emit('media upload', { ...messagePayload })
}