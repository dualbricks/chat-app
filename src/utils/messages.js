const generateMessage = (displayName,text) => {
    return {
        displayName,
        text,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage
}