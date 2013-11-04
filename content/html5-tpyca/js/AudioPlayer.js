function AudioPlayer(elementId) {
    this.audioElement = document.getElementById(elementId);

    this.play = function() {
        audioElement.play();
    }

    this.pause = function() {
        audioElement.pause();
    }

    this.volumeUp = function () {
        audioElement.volume += 0.1;
    }

    this.volumeDown = function () {
        audioElement.volume -= 0.1;
    }

    return this;
}