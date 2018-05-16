const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const config = require('config');
const requestP = require('request-promise-native');

// add timestamp to all logs
console._error = console.error
console._log = console.log
console.error = (msg)=>{ 
	let d = new Date();
	console._error(d.toString()+" - "+msg);
} 
console.log = (msg)=>{
	let d = new Date();
	console._log(d.toString()+" - "+msg);
}

const app = express();
const adminApp = express();

app.use(express.static(__dirname + "/public"));

app.get("/test",(req, res)=>{
	res.end("Test worked. Node Version: "+process.version);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const groupObj = {};
groupObj.admin=[];

wss.on('connection', function connection(ws, req) {

	setInterval(()=>{
		ws.send(JSON.stringify({"ping":(new Date()).toString()}))
	},1000*60);
	ws.send(JSON.stringify({"ping":(new Date()).toString()}))

    const location = url.parse(req.url, true);

    // message to set up groups
    ws.on('message', function incoming(message) {

        if(ws.group === undefined){

    		console.log("new message "+message);

	    	let {group, userType} = JSON.parse(message);

	    	if( group !== undefined ){
	    		groupObj[group] = groupObj[group] === undefined ? [] : groupObj[group];
	    		ws.group = group;
	    		ws.userType = userType;
	    		groupObj[group].push(ws);
	    		let toPrint = 'Added "'+userType+'" to group '+"group["+ws.group+"].length: "+groupObj[ws.group].length; 
        		console.log(toPrint);
	    		//sendToGroup(toPrint, groupObj[ws.group], ws);
    			ws.send(JSON.stringify({"msg":"Welcome, new "+ws.userType})); // TODO 
	    	}else{
	    		console.error("message.group is not defined");
	    		try{
	    			ws.close(1003,"ws.group is not defined")
	    		}catch(e){
	    			console.log(e)
	    		}
	    	}
        }else{

        	if( ws.group !== undefined ){

        		let messageObj={};
    			try{messageObj=JSON.parse(message)}catch(e){}

    			if( messageObj.admin!==undefined ){
    				console.log("found admin message!")
        			sendToGroup(message, groupObj.admin);
    			}else if( testMessage(message) ){
    				console.log(ws.userType+" sending to group "+ws.group+" new message "+message);
        			sendToGroup(message, groupObj[ws.group], ws);
        		}
	    	}else{
	    		console.error("ws.group is not defined");
	    		ws.close(1003,"ws.group is not defined")
	    	}
        }
    });

    ws.on('error', function incoming(message) {
        console.error('errored');
    });

	// TODO make sure not finding group doesn't break it
    ws.on('close', function incoming(message) {
    	if( ws.group !== undefined){
    		let index = groupObj[ws.group].indexOf(ws);
    		groupObj[ws.group].splice(index, 1)
        	console.log(ws.userType+" connection closed groupObj["+ws.group+"].length: "+groupObj[ws.group].length);
    	}else{
        	console.log('ungrouped connection closed');
    	}
    	
    });
});

server.listen(3001, function listening() {
    console.log('Listening on '+server.address().port);
});

function sendToGroup(message, group, ws){
	if( group!==undefined ){
		let thisUserIndex = group.indexOf(ws);
		for( let i=0; i<group.length; i++ ){
			if( thisUserIndex !== i ){
				group[i].send(message)
			}
		}
	}else{
		console.error("group is not defined!");
	}
}

function testMessage(message){
	try{
		JSON.parse(message);
	}catch(e){
		return false;
	}
	return true;
}

process.on('uncaughtException', (e)=>{
	slackDrew(e.message);
	console.error(e.message);
	console.log("uncaughtException exiting");
});

function slackDrew(text){

	console.log('slacking Drew');
	return // TODO remove

	let payload = {
		"channel": "@drew.brantley", 
		"username": "webhookbot", 
		"text":"Career day node server going down!!!", 
		"icon_emoji": ":ghost:"
	};

	let options = { 
		method: 'POST',
	  	url: 'https://hooks.slack.com/services/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',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		form: { 
			payload: JSON.stringify(payload)
		} 
	};

	requestP(options)
	.then((response)=>{
	  //console.log(response);
	  console.log("done");
	}).catch((e)=>{
		console.error(e)
	  	console.log("error in request");
	})

}

//throw new Error("DREW_TEST_ERROR");
//slackDrew("test")