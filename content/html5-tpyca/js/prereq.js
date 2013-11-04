function testMp3Audio() {
	if(Modernizr.audio.mp3 == false) {
		document.getElementById('mp3Support').style.display = "none";
		document.getElementById('no-mp3Support').style.display = "inherit";
	}
	else {
		document.getElementById('mp3Support').style.display = "inherit";
		document.getElementById('no-mp3Support').style.display = "none";
	}
}

function testOggAudio() {
	if(Modernizr.audio.ogg == false) {
		document.getElementById('oggSupport').style.display = "none";
		document.getElementById('no-oggSupport').style.display = "inherit";
	}
	else {
		document.getElementById('oggSupport').style.display = "inherit";
		document.getElementById('no-oggSupport').style.display = "none";
	}
}

function testCanvas() {
	if(Modernizr.canvas == false) {
		document.getElementById('canvasSupport').style.display = "none";
		document.getElementById('no-canvasSupport').style.display = "inherit";
	}
	else {
		document.getElementById('canvasSupport').style.display = "inherit";
		document.getElementById('no-canvasSupport').style.display = "none";
	}
}

function testBorderRadius() {
	if(Modernizr.canvas == false) {
		document.getElementById('borderradiusSupport').style.display = "none";
		document.getElementById('no-borderradiusSupport').style.display = "inherit";
	}
	else {
		document.getElementById('borderradiusSupport').style.display = "inherit";
		document.getElementById('no-borderradiusSupport').style.display = "none";
	}
}

testMp3Audio();
testOggAudio();
testCanvas();
testBorderRadius();