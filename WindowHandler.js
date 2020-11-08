class WindowHandler {

	constructor(bounds=null, zoomFactor=1.2) {
		if (bounds === null) bounds = [-4,4,-4,4];
		this.bounds = bounds;
		this.zoomFactor = zoomFactor;
		this.setupWindow();
		this.axes = true;
		this.grid = true;
	}

	setupWindow() {
		this.xUnits = this.bounds[1] - this.bounds[0];
		this.yUnits = this.bounds[3] - this.bounds[2];
		this.xScale = width / this.xUnits;
		this.yScale = height / this.yUnits;
		this.originPixelX = -this.bounds[0] * this.xScale;
		this.originPixelY = this.bounds[3] * this.yScale;
		needsUpdate = true;
	}

	transformCoordinates(point) {
		return createVector(this.originPixelX + point.x * this.xScale, this.originPixelY - point.y * this.yScale);
	}

	transformCoordinates2(x, y) {
		return this.transformCoordinates(createVector(x, y));
	}
	
	reverseTransform(x, y) {
		return createVector((x - this.originPixelX) / this.xScale, (this.originPixelY - y) / this.yScale);
	}
	
	drawLine(p1, p2) {
		p1 = this.transformCoordinates(p1);
		p2 = this.transformCoordinates(p2);
		line(p1.x, p1.y, p2.x, p2.y);
	}
	
	drawLine2(x1, y1, x2, y2) {
		let p1 = this.transformCoordinates2(x1, y1), p2 = this.transformCoordinates2(x2, y2);
		line(p1.x, p1.y, p2.x, p2.y);
	}
	
	drawPolygon(pts) {
		beginShape();
		let cpt;
		for (let pt of pts) {
			cpt = this.transformCoordinates(pt);
			vertex(cpt.x,cpt.y);
		}
		endShape();
	}
	
	zoom(factor) {
		const newXUnits = (this.xUnits * factor) / 2;
		const newYUnits = (this.yUnits * factor) / 2;
		const midX = (this.bounds[0] + this.bounds[1]) / 2, midY = (this.bounds[2] + this.bounds[3]) / 2;
		
		this.bounds[0] = midX - newXUnits;
		this.bounds[1] = midX + newXUnits;
		this.bounds[2] = midY - newYUnits;
		this.bounds[3] = midY + newYUnits;
		
		this.setupWindow();
	}
	
	zoomOut() {
		this.zoom(this.zoomFactor);
	}
	
	zoomIn() {
		this.zoom(1 / this.zoomFactor);
	}

	pan(dx, dy) {
		this.bounds[0] -= dx;
		this.bounds[1] -= dx;
		this.bounds[2] += dy;
		this.bounds[3] += dy;
		this.setupWindow();
	}
	
	specialRound(x) {
        if (x>0) return ceil(x);
        return floor(x);
    }
	
	drawGridlines(nX=10, nY=10) {
		const xStep = this.xUnits / nX;
		const yStep = this.yUnits / nY;
		
		const xStart = this.specialRound(this.bounds[0] / xStep) * xStep;
        const xStop = this.specialRound(this.bounds[1] / xStep + 2) * xStep;
		const yStart = this.specialRound(this.bounds[2] / yStep) * yStep;
        const yStop = this.specialRound(this.bounds[3] / yStep + 2) * yStep;
		let point1, point2;
		
		push();
		strokeWeight(1);
		stroke(128);
		
		for (let y=yStart; y<=yStop; y+=yStep) {
			point1 = this.transformCoordinates2(this.bounds[0], y);
			point2 = this.transformCoordinates2(this.bounds[1], y);
			line(point1.x, point1.y, point2.x, point2.y);
		}
		
		for (let x=xStart; x<xStop; x+=xStep) {
			point1 = this.transformCoordinates2(x, this.bounds[2]);
			point2 = this.transformCoordinates2(x, this.bounds[3]);
			line(point1.x, point1.y, point2.x, point2.y);
		}
		
		pop();
	}

	drawAxes() {
		push();
		strokeWeight(4);
		stroke(0);
		if (0 >= this.bounds[0] && 0 <= this.bounds[1]) {
			let point1 = this.transformCoordinates2(0, this.bounds[2]);
			let point2 = this.transformCoordinates2(0, this.bounds[3]);
			line(point1.x, point1.y, point2.x, point2.y);
		}

		if (0 >= this.bounds[2] && 0 <= this.bounds[3]) {
			let point1 = this.transformCoordinates2(this.bounds[0], 0);
			let point2 = this.transformCoordinates2(this.bounds[1], 0);
			line(point1.x, point1.y, point2.x, point2.y);
		}

		pop();
	}
	
	toggleGridlines() {
		this.grid = !this.grid;
		needsUpdate = true;
	}
	
	toggleAxes() {
		this.axes = !this.axes;
		needsUpdate = true;
	}
	
	update() {
		if (this.grid) this.drawGridlines();
		if (this.axes) this.drawAxes();
	}

}