window.addEventListener("load", ()=>{
	window.body = document.querySelector("body");
})

function doAction(message){
	if( typeof message === "object" ){
		let {xPercent,yPercent,color,shape} = message;

		let x = xPercent*window.innerWidth;
		let y = yPercent*window.innerHeight;
        
		makeElement(x,y,color)
		.then(expandElement)
		.then(fadeElement)
		.then(removeElement)

	}else{
		return {"error":"message must be an object"};
	}
}

function makeElement(x,y,color){
	return new Promise((resolve, reject)=>{
		let element = document.createElement("div");
		element.style.width = "0px";
		element.style.height = "0px";
		element.style.backgroundColor = color;
		element.style.left = x;
		element.style.top = y;
		element.style.position = "absolute";
		element.style.borderRadius = "50%";

		console.log({x,y})
		body.appendChild(element);

		console.log(element)

		resolve(element);
	})
};

function expandElement(element){
	return new Promise((resolve, reject)=>{

		let incrementStep = 100;

		let intervalNumber = setInterval(()=>{
			let oldNumber = parseInt(element.style.width);

			let newNumber=oldNumber+incrementStep;

			let boundRect = element.getBoundingClientRect();

			let width = parseInt(boundRect.width);
			let height = parseInt(boundRect.height);
			let elementLeft = boundRect.left;
			let elementRight = boundRect.right;
			let elementTop = boundRect.top;
			let elementBottom = boundRect.bottom;

			let shouldStop = elementLeft<=0;
			shouldStop = shouldStop & elementRight>=window.innerWidth;
			shouldStop = shouldStop & elementTop<=0;
			shouldStop = shouldStop & elementBottom>=window.innerHeight;

			if(shouldStop){
				clearInterval(intervalNumber);
				resolve(element);
			}

			element.style.width = newNumber+"px";
			element.style.height = newNumber+"px";

			element.style.left = (elementLeft-(incrementStep/2))+"px";
			element.style.top = (elementTop-(incrementStep/2))+"px";
		},30)
		
	})
};

function fadeElement(element){
	return new Promise((resolve, reject)=>{

		let incrementStep = .1;
		let opacity = 1;

		document.querySelector("body").style.backgroundColor=element.style.backgroundColor;

		// let intervalNumber = setInterval(()=>{
		// 	opacity-=incrementStep
		// 	element.style.opacity = opacity;
		// 	if(opacity<=0){
		// 		resolve(element);
		// 	}
		// },100)

		resolve(element)
		
	})
};

function removeElement(element){
	return new Promise((resolve, reject)=>{
		element.parentElement.removeChild(element);
		console.log("removing element")
	})
};
