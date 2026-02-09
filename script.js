const home = document.getElementById("home");
const rngPage = document.getElementById("rngPage");

const quantumOutput = document.getElementById("quantumOutput");
const classicalOutput = document.getElementById("classicalOutput");

// When Random No Generation button is clicked
document.querySelector(".red").onclick = () => {
    home.classList.add("hidden");
    rngPage.classList.remove("hidden");
};

// Temporary random generators
document.querySelector(".quantum .generate").onclick = () => {
    quantumOutput.innerText = Math.floor(Math.random() * 2);
};

document.querySelector(".classical .generate").onclick = () => {
    classicalOutput.innerText = Math.floor(Math.random() * 100);
};
