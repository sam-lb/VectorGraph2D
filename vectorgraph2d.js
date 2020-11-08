

class UIHandler {
	
	constructor(objectDivId="object-div") {
		this.objectId = 0;
		this.objectDiv = document.getElementById("object-div");
		
		this.elements = {
			1: {
				inputLabels: [],
				sliders: [],
				displayLabels: ["x: ", "y: ", "Divergence: "],
				buttons: [],
			},
			2: {
				inputLabels: [],
				sliders: [],
				displayLabels: ["x: ", "y: ", "Curl: "],
				buttons: [],
			},
			3: {
				inputLabels: ["x: ", "y: "],
				sliders: [{label: "t min: ", low: -20, up: 0,}, {label: "t span: ", low: 1, up: 20,}],
				displayLabels: ["Line integral: "],
				buttons: [],
			},
			4: {
				inputLabels: ["Name: "],
				sliders: [{label: "Value: ", low: -10, up: 10,}],
				displayLabels: [],
				buttons: [],
			},
			5: {
				inputLabels: ["x1(t): ", "y1(t): "],
				sliders: [{label: "t1 min", low: -20, up: 0,}, {label: "t1 span", low: 0, up: 20,}],
				displayLabels: ["Line integral: "],
				buttons: [{label: "New curve segment", onclick: ()=>{},}],
			},
		};
	}
	
	createObjectField(name, inputLabels, sliders, displayLabels, buttons) {
		const div = document.createElement("div");
		div.setAttribute("id", "object-subdiv-"+this.objectId);
		div.setAttribute("class", "object-subdiv");
		div.innerHTML += `<p>${name} (ID: ${this.objectId})</p><hr>`
		
		for (let i=0; i<inputLabels.length; i++) {
			div.innerHTML += `<label for="text-input-${this.objectId}-${i}">${inputLabels[i]}</label><input type="text" id="text-input-${this.objectId}-${i}"></input><br>`
		}
		
		for (let i2=0; i2<sliders.length; i2++) {
			let slider = sliders[i2];
			div.innerHTML += `<label for="range-input-${this.objectId}-${i2}">${slider.label}</label><input type="range" id="range-input-${this.objectId}-${i2}" min="${slider.low}" max="${slider.up}" step="${(slider.up-slider.low)/100}"></input><br>`;
		}
		
		for (let i3=0; i3<displayLabels.length; i3++) {
			div.innerHTML += `<label for="display-${this.objectId}-${i3}">${displayLabels[i3]}</label><p id="display-${this.objectId}-${i3}"></p>`;
		}
		
		for (let i4=0; i4<buttons.length; i4++) {
			let button = buttons[i4];
			div.innerHTML += `<input type="button" class="sbtn" value="${button.label}" onclick="${button.onclick}" id="button-${this.objectId}-${i4}"></input><br><br>`;
		}
		
		div.innerHTML += `<input type="button" class="sbtn" onclick="ui.deleteObjectField(${this.objectId});" value="Delete ${name}"></input>`;
		this.objectDiv.appendChild(div);
		this.objectId++;
	}
	
	readObjectField(id) {
		const result = {
			inputs: [],
			sliders: [],
			displays: [],
			buttons: [],
		};
		
		while (document.getElementById("text-input-${id}-${i}") !== undefined) {
			result.inputs.push(document.getElementById("text-input-${id}-${i}"));
		}
		while (document.getElementById("range-input-${id}-${i}") !== undefined) {
			result.sliders.push(document.getElementById("range-input-${id}-${i}"));
		}
		while (document.getElementById("display-${id}-${i}") !== undefined) {
			result.displays.push(document.getElementById("display-input-${id}-${i}"));
		}
		while (document.getElementById("button-input-${id}-${i}") !== undefined) {
			result.buttons.push(document.getElementById("button-input-${id}-${i}"));
		}
	}
	
	readObjectFieldValues(id) {
		const objects = this.readObjectField(id);
		const result = {
			inputValues: [],
			sliderValues: [],
		};
		
		for 
	}
	
	deleteObjectField(id) {
		const div = document.getElementById("object-subdiv-"+id);
		div.parentNode.removeChild(div);
	}
	
	addObject() {
		const dropdown = document.getElementById("new-object-dropdown");
		const name = dropdown.options[dropdown.selectedIndex].text;
		const elements = this.elements[parseInt(dropdown.value)];
		
		this.createObjectField(name, elements.inputLabels, elements.sliders, elements.displayLabels, elements.buttons);
		
		dropdown.selectedIndex = 0;
	}
	
}

class VectorField {
	
	constructor(dx_dt, dy_dt) {
		this.dx_dt = dx_dt;
		this.dy_dt = dy_dt;
	}
	
	fp(x, y) {
		try {
			const scope = {"x":x, "y":y,};
			return createVector(this.dx_dt.evaluate(scope), this.dy_dt.evaluate(scope));
		} catch (e) {
			return createVector(0,0);
		}
	}
	
	drawArrow(p1, p2) {
		let sub = p5.Vector.sub(p2, p1);
		const mag = sub.mag()/6;
		const angle = atan2(sub.y, sub.x);
		
		const a = map(abs(angle), 0, PI, 0, 255);
		const color = createVector(255-a, a, a);
		
		push();
		stroke(color.x, color.y, color.z);
		fill(color.x, color.y, color.z);
		handler.drawLine(p1, p2);
		handler.drawPolygon([p2, p5.Vector.sub(p2, p5.Vector.fromAngle(angle-PI/8).mult(mag)), p5.Vector.sub(p2, p5.Vector.fromAngle(angle+PI/8).mult(mag))]);
		pop();
	}
	
	drawField() {
		let tail, head, density=10/handler.xUnits; // density: arrows per unit
		const step = 1 / density;
		
		const xStart = handler.specialRound(handler.bounds[0] / step - 2) * step;
        const xStop = handler.specialRound(handler.bounds[1] / step + 2) * step;
		const yStart = handler.specialRound(handler.bounds[2] / step - 2) * step;
        const yStop = handler.specialRound(handler.bounds[3] / step + 2) * step;
		
		for (let x=xStart; x<=xStop; x+=step) {
			for (let y=yStart; y<=yStop; y+=step) {
				tail = createVector(x, y);
				head = this.fp(x, y);
				head.setMag(step);
				head.add(tail);
				this.drawArrow(tail, head);
			}
		}
	}
	
	drawFlowline(p, steps=100, scale=0.25) {
		// total steps = density * xunits * density * yunits * steps
		let lastP = p.copy(), v, a;
		for (let i=0; i<steps; i++) {
			v = this.fp(p.x, p.y).mult(scale);
			a = map(abs(atan2(v.y, v.x)), 0, PI, 0, 255);
			stroke(a, 255-a, 255-a);
			p.add(v);
			handler.drawLine(lastP, p);
			lastP = p.copy();
		}
	}
	
	drawFlow() {
		push();
		
		const density = 5 / handler.xUnits;
		const step = 1 / density;		
		const xStart = handler.specialRound(handler.bounds[0] / step - 2) * step;
        const xStop = handler.specialRound(handler.bounds[1] / step + 2) * step;
		const yStart = handler.specialRound(handler.bounds[2] / step - 2) * step;
        const yStop = handler.specialRound(handler.bounds[3] / step + 2) * step;
		
		//stroke(0, 255, 0);
		strokeWeight(4);
		for (let x=xStart; x<=xStop; x+=step) {
			for (let y=yStart; y<=yStop; y+=step) {
				this.drawFlowline(createVector(x, y));
			}
		}
		pop();
	}
	
	setFunctions(dx_dt, dy_dt) {
		this.dx_dt = dx_dt;
		this.dy_dt = dy_dt;
		needsUpdate = true;
	}
	
}


class Meter {
	
	constructor(x=0, y=0, radius=15) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.value = null;
	}
	
	computeFunction(x, y) {
		
	}
	
	getValue() {
		return this.computeFunction(this.x, this.y);
	}
	
	draw() {
		const coordinates = handler.transformCoordinates2(this.x, this.y);
		push();
		fill(255, 0, 0);
		stroke(0);
		strokeWeight(1);
		circle(coordinates.x, coordinates.y, this.radius);
		pop();
	}
	
}


class DivergenceMeter extends Meter {
	
	constructor(x=0, y=0, radius=70) {
		super(x, y, radius);
	}
	
	computeFunction(x, y) {
		// compute divergence
		return x;
	}
	
}


class CurlMeter extends Meter {
	
	constructor(x=0, y=0, radius=70) {
		super(x, y, radius);
	}
	
	computeFunction(x, y) {
		// compute curl
		return y;
	}
	
}




let functionBoxId, funcCount, splash, runningTime, handler, lastPoint, field, boxError, needsUpdate, ui, meters;
function setup() {
	
	if (windowWidth < windowHeight) {
		alert("This app runs best on wide screens. If you're on mobile, switch to landscape mode for best results.");
	}
	
	const canvas = createCanvas(windowWidth*.7, windowHeight);
	canvas.parent("canvas-div");
	document.getElementById("gui-div").style.height = windowHeight.toString() + "px";
	functionBoxId = 12;
	funcCount = 0;
	
	splash = true;
	runningTime = 0;
	textSize(width*0.05);
	handler = new WindowHandler();
	lastPoint = null;
	boxError = false;
	needsUpdate = true;
	
	ui = new UIHandler();
	field = new VectorField(math.compile("y"), math.compile("-x"));
	meters = [new DivergenceMeter()];
}

function handleFunctionBoxes() {
	let xt = document.getElementById("core-field-box-x");
	let yt = document.getElementById("core-field-box-y");
	
	try {
		xt = math.compile(xt.value);
		yt = math.compile(yt.value);
		document.getElementById("core-field-box-x").style.backgroundColor = "white";
		document.getElementById("core-field-box-y").style.backgroundColor = "white";
		boxError = false;
	} catch (e) {
		xt = math.compile("0");
		yt = math.compile("0");
		document.getElementById("core-field-box-x").style.backgroundColor = "#faa";
		document.getElementById("core-field-box-y").style.backgroundColor = "#faa";
		boxError = true;
	}
	
	field.setFunctions(xt, yt);
}

function mouseDragged() {
	if (0 <= mouseX && mouseX <= width && 0 <= mouseY && mouseY <= height) {
		for (let meter of meters) {
			const pos = handler.transformCoordinates2(meter.x, meter.y);
			if (dist(pos.x, pos.y, mouseX, mouseY) <= meter.radius) {
				const newPos = handler.reverseTransform(mouseX, mouseY);
				meter.x = newPos.x;
				meter.y = newPos.y;
				needsUpdate = true;
				return;
			}
		}
		
		let currentPoint = createVector(mouseX, mouseY);
		if (lastPoint !== null) {
			handler.pan((currentPoint.x-lastPoint.x)/handler.xScale, (currentPoint.y-lastPoint.y)/handler.yScale);
		}
		lastPoint = currentPoint;
	}
}

function mouseReleased() {
	lastPoint = null;
}

function drawSplash(t, maxT) {
	maxT *= 4/3
	t = min(4/3*t, maxT);
	
	background(255);
	fill(11, 57, 84);
	noStroke();
	strokeWeight(3);
	let w = textWidth("VectorGraph2D");
	circle(width/2, height/2, w+10*pow(t,5)+20);
	fill(255);
	circle(width/2, height/2, w+(10*pow(t,5)+20)*4/5);
	stroke(0);
	strokeWeight(4);
	text("VectorGraph2D", (width-w)/2, height/2+textSize()/4);
	
	strokeWeight(2);
	stroke(0);
	line((width-w)/2, height/2+textSize()/2+5, (width-w)/2+w*t/maxT, height/2+textSize()/2+5);
	line((width+w)/2, height/2-textSize()/2-5, (width+w)/2-w*t/maxT, height/2-textSize()/2-5);
}

function draw() {
	if (frameCount > 1) {
		if (runningTime <= 2) {
			drawSplash(runningTime, 1.5);
		} else {
			if (needsUpdate) {
				background(255);
				handler.update();
				if (document.getElementById("core-field-enabled").checked && !boxError) field.drawField();
				if (document.getElementById("core-flow-enabled").checked && !boxError) field.drawFlow();
				needsUpdate = false;
			}
			for (let meter of meters) {
				meter.draw();
			}
		}
		runningTime += 1/frameRate();
	}
}
