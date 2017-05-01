function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

var url = getURLParameter("md");
var md = document.getElementsByTagName("section")[0];
md.setAttribute("data-markdown", url);
