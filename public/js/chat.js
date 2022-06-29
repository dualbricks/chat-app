const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')
const $locationButton = document.querySelector('#send-location')


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML


//socket listeners
socket.on('locationMessage', ({text, createdAt})=>{
    const html = Mustache.render(locationTemplate, {
        url: text,
        createdAt: moment(createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)

})


socket.on('message', ({text, createdAt})=>{

    const html = Mustache.render(messageTemplate, {
        message: text,
        createdAt: moment(createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})


$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    //disable
    
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    if(message == '') {
        $messageFormButton.removeAttribute('disabled')
        return
    }
    socket.emit('sendMessage', message, (error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        //enable
        if(error) {
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

$locationButton.addEventListener('click', ()=>{
    $locationButton.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation) {
        return alert('Gelocation is not supported by your browser.')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude:position.coords.longitude
        }, (message)=>{
            $locationButton.removeAttribute('disabled')
            console.log("Location shared", message)
        })
    })
})