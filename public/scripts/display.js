const webSocketUrl = "ws://"+document.location.host;

setUpSocket()

function setUpSocket() {
    let ws;

    try {
        ws = new WebSocket(webSocketUrl);
    } catch (e) {
        console.error(e);
        reject(e);
        alert("Error connecting to WebSocket");
    }

    ws.onopen = function() {
    	console.log("socket connection open");
    	ws.send(JSON.stringify({"group":"careerDay","userType":"display"}));
    };

    ws.onmessage = function(message){
    	try{
    		message = JSON.parse(message.data);

            let shouldSend = message.xPercent!==undefined;
            shouldSend = shouldSend && message.yPercent!==undefined;
            shouldSend = shouldSend && message.color!==undefined;
            shouldSend = shouldSend && message.shape!==undefined;

            if(shouldSend){
                doAction(message);
            }

    	}catch(e){
            debugger
            throw new Error("message can not be parsed");
        }
    }
}
