// JavaScript for the landing page
// Button hover animation:
var button = document.getElementById("button_id1");
var button2 = document.getElementById("button_id2");
if (button) {
    button.addEventListener("mouseover", animateLoop);
    button.addEventListener("mouseout", endloop);
}
if (button2) {
    button2.addEventListener("mouseover", animateLoop);
    button2.addEventListener("mouseout", endloop);
}
function animateLoop() {
    if (button) {
        button.classList.add("animationjs");
        button.style.backgroundColor = "rgb(50, 75, 248)";
    }
    if (button2) {
        button2.classList.add("animationjs");
        button2.style.backgroundColor = "#555";
    }
}
function endloop() {
    if (button) {
        button.style.backgroundColor = "white";
        button.classList.remove("animationjs");
    }
    if (button2) {
        button2.style.backgroundColor = "#333";
        button2.classList.remove("animationjs");
    }
}
