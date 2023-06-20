// TODO: I can't use `this` in any of these functions, because they are used
// as event listeners, and when they are called, `this` usually refers to the websocket.

export class Network
{
    constructor()
    {
        this.serverAddress = "wss.kerrishaus.com/games/strategy";
        
        this.connectionRetryInterval = 3000;
        this.connectionRetryCount    = 0;

        console.log("Network class is ready.");
    }

    attemptConnection()
    {
        if (!document.dispatchEvent(new CustomEvent("preServerConnection")))
        {
            console.log("Aborting server connection because preServerConnection was prevented.");
            return false;
        }

        console.log("Attempting to connect to server " + network.serverAddress);
        
        // TODO: later change this to network.socket
        window.socket = new WebSocket("wss://" + network.serverAddress);
        
        socket.addEventListener("open",  network.connectionSuccessful);
        socket.addEventListener("error", network.socketError);
        
        if (network.connectionRetryCount > 3)
        {
            console.error("Failed to connect to server after 3 retries.");
            document.dispatchEvent(new CustomEvent("serverConnectionFailed"));
            return false;
        }

        // TODO: give this an upper limit
        network.connectionRetryCount += 1;
    }

    connectionSuccessful()
    {
        console.log("Successfully connected to server.");
        
        network.connectionRetryCount = 0;
        
        socket.addEventListener("close",   network.socketClose);
        socket.addEventListener("message", network.socketMessage);
        
        document.dispatchEvent(new CustomEvent("serverConnected"));
    }

    // occurs if the socket fails to connect, loses connection, or fails to send data
    socketError(event)
    {
        console.error("Fatal socket error occured: ", event);
        
        network.socketClose();

        document.dispatchEvent(new CustomEvent("serverSocketError"));
        
        setTimeout(network.attemptConnection, network.connectionRetryInterval);
        
        console.log("Attempting retry in " + network.connectionRetryInterval / 1000 + " seconds.");
    }
 
    socketClose()
    {
        console.log("Lost connection to server.");

        document.dispatchEvent(new CustomEvent("serverDisconnected"));
    }

    socketMessage(event)
    {
        if (typeof event.data == "string")
        {
            try
            {
                const data = JSON.parse(event.data);
                console.log("SERVER: ", data);

                if (data.command == "welcome")
                {
                    if (window.clientId > 0)
                    {
                        console.error("Client ID is already set, wwhy are we being welcomed again?!");
                        return;
                    }

                    window.clientId = data.clientId;
                    $("#debug-clientId").text(clientId);
                    console.log("We are client " + clientId);
                    document.dispatchEvent(new CustomEvent("networkClientReady"));
                    return;
                }

                document.dispatchEvent(new CustomEvent(data.command, { detail: data }));
            }
            catch (exception)
            {
                console.log("An exception occured while reading a socket message.", exception);
            }
        }
    }
};