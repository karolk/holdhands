var ws = require("nodejs-websocket")

clients = {}

function registerClient(socket, channel) {
    if (!(channel in clients)) {
        clients[channel] = []
    }
    if (clients[channel].indexOf(socket) === -1) {
        clients[channel].push(socket)
    }
    return clients[channel]
}

function unregisterClient(socket, channel) {
    if (channel in clients) {
        var index = clients[channel].indexOf(socket)
        clients[channel].splice(index, 1)
    }
    return clients[channel]
}

function broadcast(message, channel) {
    if (channel in clients) {
        clients[channel].forEach(function(socket, index, all) {
            socket.sendText(message)
        })
    }
}

var server = ws.createServer(function(socket) {
    var channel
    socket.on("text", function(message) {
                
        var chunks = message.split(",") 
        channel = chunks[0]
        var client = chunks[1]
        var message = chunks[2]
                
        registerClient(socket, channel)

        var response = [client, message].join(",")
        broadcast(response, channel)
        
    })
    
    socket.on("close", function() {
        unregisterClient(socket, channel)
    })
})

server.listen(8001)
