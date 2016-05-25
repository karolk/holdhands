(function(global) {

    function Socket(url) {
        if (!this.hasFeatures()) return null
        if (!this.socket) this.socket = new WebSocket(url)
    }

    Socket.prototype.hasFeatures = function() {
        return typeof WebSocket === "function" || typeof WebSocket === "object" //Safari
    }

    Socket.prototype.send = function(message) {
        if (this.socket.readyState === 1) {
            this._send(message)
        }
        else {
            this.socket.onopen = function() {
                this._send(message)
            }
        }
    }

    Socket.prototype._send = function(message) {
        this.socket.send(message)
    }
    
    Socket.prototype.onmessage = function(callback) {
        this.socket.onmessage = callback
    }
    
    global.Socket = Socket

})(this)

function highlight(id, color) {
    var elem = document.getElementById(id)
    elem.style.backgroundColor = color
    elem.style.borderRadius = '50%'
    setTimeout(function() {
        elem.style.backgroundColor = ""
        elem.style.borderRadius = ""
    }, 2000)
}

function main() {
    var socket = new Socket("ws://" + location.hostname + ":8001")
    
    var channel = "test1"
    var client = Math.floor(Math.random()*1e8).toString(16)
    
    function wrapRequest(text) {
        return [channel, client, text].join(",")
    }
    
    var eventName = "ontouchend" in this ? "touchend" : "click"
    document.addEventListener(eventName, function(event) {
        var elem = event.target
        if (elem.nodeName === "DIV" && elem.id.startsWith("s")) {
            if (socket) {
                var request = wrapRequest(elem.id.replace(/\D/, ""))
                socket.send(request)
            }
        }
    }, true)
    
    if (socket) {
        socket.onmessage(function(response) {
            var chunks = response.data.split(",")
            var updateClient = chunks[0]
            var squareId = chunks[1]
            if (updateClient !== client) {
                highlight("s"+squareId, "green")
                navigator.vibrate(200)
            }
            else {
                highlight("s"+squareId, "orange")
            }
        })
    }
    
}

main()
