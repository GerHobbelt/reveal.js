// Look for slides that have an image on them with an alt attribute set to
// fullscreen, and set this image as the body background image whenever that
// slide is displayed.

var BGR;

function fullscreen(event) {
  var elem = event.currentSlide.querySelector("[alt=fullscreen]")

  if(elem){
    var url = elem.getAttribute('src')

    if(url){
      if(typeof BGR == "undefined"){
        // Store background value
        BGR = document.body.style.background;
        console.log(BGR)
      }

      // Set image from fullscreen-img attribute as body background
      document.body.style.backgroundImage = "url('" + url + "')"
      document.body.style.backgroundSize = "cover"
      }
    }
  else { 
    if(typeof BGR != "undefined") { 
      document.body.style.backgroundImage = "none";
      document.body.style.background      = BGR;
    } 
  }
}

Reveal.addEventListener('ready', function(event) {
  fullscreen(event)
}, false )

Reveal.addEventListener('slidechanged', function(event) {
  fullscreen(event)
}, false )
