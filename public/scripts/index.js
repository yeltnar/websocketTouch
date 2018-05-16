const webSocketUrl = "ws://"+document.location.host

let color = "white";
let shape = "circle";

//-------------------------------------------------------------------------

window.onload=()=>{
    setColor("pink");
    setShape("circle");
}

window.addEventListener("click",(event)=>{
    let xPercent = event.pageX/window.innerWidth;
    let yPercent = event.pageY/window.innerHeight;

    console.log(event.pageX+" "+event.pageY)
    // debugger

    let toSend = {xPercent,yPercent,color,shape};

    sendToDisplay(toSend);

    let colorPick = (()=>{

        if(color==="blue"){
            return "green"
        }else if(color==="red"){
            return "blue"
        }else{
            return "red"
        }
    })()
    setColor(colorPick);
});

setUpSocket().then((send)=>{
    sendToDisplay = send;
    toSendQue.forEach((ele,i,arr)=>{
        sendToDisplay(ele);
    });
    toSendQue=[];
})

//-------------------------------------------------------------------------

let toSendQue = [];
function sendToDisplay(objToSend){
    toSendQue.push(objToSend);
}

function setUpSocket() {

    return new Promise((resolve, reject)=>{
        let ws;

        try {
            ws = new WebSocket(webSocketUrl);
        } catch (e) {
            console.error(e);
            reject(e);
            alert("Error connecting to WebSocket");
        }

        function send(objToSend){
            if(typeof objToSend!=="object"){
                throw new Error("must send an object");
            }else{
                ws.send(JSON.stringify(objToSend));   
                console.log("sent ...");
                console.log(objToSend);
            }
        }

        ws.onopen = function() {
            console.log("socket connection open");
            ws.send(JSON.stringify({"group":"careerDay","userType":"display"}));
            resolve(send);
        };
    })
}

function setColor(incoming_color){
    color = incoming_color;
    let body = document.querySelector("body")
    body.style.backgroundColor = color;
}

function setShape(incoming_shape){
    shape = incoming_shape
}

