// ================== DOM REFERENCES ==================
const home = document.getElementById("home");
const rngPage = document.getElementById("rngPage");
const analysisPage = document.getElementById("analysisPage");

const quantumOutput = document.getElementById("quantumOutput");
const classicalOutput = document.getElementById("classicalOutput");

const analysisBackBtn = document.getElementById("analysisBackBtn");

// ================== DATA STORAGE ==================
let classicalHistory = [];
let quantumHistory = [];

let classicalBinary = [];
let quantumBinary = [];

let classicalBinaryMode = false;
let quantumBinaryMode = false;

let currentMode = "rng";

// ================== NAVIGATION ==================

document.querySelector(".red").onclick = () => {
    currentMode = "rng";

    document.querySelector(".quantum h2").innerText = "Quantum RNG (Qiskit)";
    document.querySelector(".classical h2").innerText = "Classical RNG";

    home.classList.add("hidden");
    rngPage.classList.remove("hidden");
};

document.querySelector(".blue").onclick = () => {
    currentMode = "password";

    document.querySelector(".quantum h2").innerText = "Quantum Password Generator";
    document.querySelector(".classical h2").innerText = "Classical Password Generator";

    home.classList.add("hidden");
    rngPage.classList.remove("hidden");
};

document.getElementById("backBtn").onclick = () => {
    rngPage.classList.add("hidden");
    home.classList.remove("hidden");

    quantumOutput.innerText = "---";
    classicalOutput.innerText = "---";
};

document.getElementById("analyzeBtn").onclick = () => {
    rngPage.classList.add("hidden");
    analysisPage.classList.remove("hidden");
    renderAnalysis();
};

analysisBackBtn.onclick = () => {
    analysisPage.classList.add("hidden");
    rngPage.classList.remove("hidden");
};

// ================== GENERATE ==================

document.querySelector(".quantum .generate").onclick = () => {

    fetch("http://127.0.0.1:5000/quantum/500")
        .then(res => res.json())
        .then(data => {

            const values = data.random_numbers;

            quantumHistory = values;
quantumBinary = convertToBinary(values);
quantumBinaryMode = false;

            quantumOutput.innerText = values.join(", ");

        });
};

document.querySelector(".classical .generate").onclick = () => {

    fetch("http://127.0.0.1:5000/classical/500")
        .then(res => res.json())
        .then(data => {

            const values = data.random_numbers;

            classicalHistory = values;
classicalBinary = convertToBinary(values);
classicalBinaryMode = false;

            classicalOutput.innerText = values.join(", ");

        });
};

// ================== CONVERSIONS ==================

function convertToBinary(numbers){
    return numbers.map(n => n.toString(2).padStart(8,'0'));
}

function numbersToBits(numbers){

    let bits = [];

    numbers.forEach(n => {

        let b = n.toString(2).padStart(8,'0');

        for(let bit of b){
            bits.push(Number(bit));
        }

    });

    return bits;
}
document.getElementById("quantumToggle").onclick = () => {

    if(quantumHistory.length === 0) return;

    quantumBinaryMode = !quantumBinaryMode;

    if(quantumBinaryMode){
        quantumOutput.innerText = quantumBinary.join(", ");
        document.getElementById("quantumToggle").innerText = "Decimal";
    } else {
        quantumOutput.innerText = quantumHistory.join(", ");
        document.getElementById("quantumToggle").innerText = "Binary";
    }
};
document.getElementById("classicalToggle").onclick = () => {

    if(classicalHistory.length === 0) return;

    classicalBinaryMode = !classicalBinaryMode;

    if(classicalBinaryMode){
        classicalOutput.innerText = classicalBinary.join(", ");
        document.getElementById("classicalToggle").innerText = "Decimal";
    } else {
        classicalOutput.innerText = classicalHistory.join(", ");
        document.getElementById("classicalToggle").innerText = "Binary";
    }
};
// ================== HISTOGRAM ==================

function buildHistogram(data){

    const freq = {};

    data.forEach(v => {

        freq[v] = (freq[v] || 0) + 1;

    });

    return freq;
}

// ================== ENTROPY ==================

function entropy(data){

    const freq = buildHistogram(data);
    const total = data.length;

    let H = 0;

    for(let k in freq){

        const p = freq[k] / total;

        H -= p * Math.log2(p);

    }

    return H.toFixed(4);
}

// ================== CHI SQUARE ==================

function chiSquare(data, possibleValues){

    const freq = buildHistogram(data);

    const expected = data.length / possibleValues;

    let chi = 0;

    for(let i = 0; i < possibleValues; i++){

        const observed = freq[i] || 0;

        chi += Math.pow(observed - expected,2) / expected;

    }

    return chi.toFixed(4);
}

// ================== AUTOCORRELATION ==================

function autocorrelation(data){

    const mean = data.reduce((a,b)=>a+b)/data.length;

    let numerator = 0;
    let denominator = 0;

    for(let i=0;i<data.length-1;i++){

        numerator += (data[i]-mean)*(data[i+1]-mean);
        denominator += Math.pow(data[i]-mean,2);

    }

    return (numerator/denominator).toFixed(6);
}

// ================== ANALYSIS ==================

function renderAnalysis(){

    const classicalNumbers = classicalHistory;
    const quantumNumbers = quantumHistory;

    const classicalBits = numbersToBits(classicalNumbers);
    const quantumBits = numbersToBits(quantumNumbers);

    // ---------- HISTOGRAM ----------

    const classicalFreq = buildHistogram(classicalNumbers);
    const quantumFreq = buildHistogram(quantumNumbers);

    new Chart(document.getElementById("classicalChart"),{

        type:"bar",

        data:{
            labels:Object.keys(classicalFreq),

            datasets:[{
                label:"Frequency",
                data:Object.values(classicalFreq),
                backgroundColor:"#2ecc71"
            }]
        }

    });

    new Chart(document.getElementById("quantumChart"),{

        type:"bar",

        data:{
            labels:Object.keys(quantumFreq),

            datasets:[{
                label:"Frequency",
                data:Object.values(quantumFreq),
                backgroundColor:"#9b59b6"
            }]
        }

    });
    // BIT FREQUENCY

const classicalBitFreq = buildHistogram(classicalBits);
const quantumBitFreq = buildHistogram(quantumBits);

new Chart(document.getElementById("bitFrequencyChart"), {
    type: "bar",
    data: {
        labels: ["0","1"],
        datasets: [
            {
                label: "Classical",
                data: [
                    classicalBitFreq[0] || 0,
                    classicalBitFreq[1] || 0
                ],
                backgroundColor: "#2ecc71"
            },
            {
                label: "Quantum",
                data: [
                    quantumBitFreq[0] || 0,
                    quantumBitFreq[1] || 0
                ],
                backgroundColor: "#9b59b6"
            }
        ]
    }
});



drawBitGrid(quantumBits);
    // ---------- ENTROPY ----------

    const classicalEntropyNum = entropy(classicalNumbers);
    const quantumEntropyNum = entropy(quantumNumbers);

    const classicalEntropyBits = entropy(classicalBits);
    const quantumEntropyBits = entropy(quantumBits);

    // ---------- CHI SQUARE ----------

    const classicalChiNum = chiSquare(classicalNumbers,256);
    const quantumChiNum = chiSquare(quantumNumbers,256);

    const classicalChiBits = chiSquare(classicalBits,2);
    const quantumChiBits = chiSquare(quantumBits,2);

    // ---------- AUTOCORRELATION ----------

    const classicalAutoNum = autocorrelation(classicalNumbers);
    const quantumAutoNum = autocorrelation(quantumNumbers);

    const classicalAutoBits = autocorrelation(classicalBits);
    const quantumAutoBits = autocorrelation(quantumBits);






        new Chart(document.getElementById("metricsChart"), {

    type:"bar",

    data:{
        labels:[
            "Bit Entropy",
            "Chi-square(bits)",
            "Autocorrelation(bits)"
        ],

        datasets:[
            {
                label:"Classical",
                data:[
                    classicalEntropyBits,
                    classicalChiBits,
                    classicalAutoBits
                ],
                backgroundColor:"#2ecc71"
            },
            {
                label:"Quantum",
                data:[
                    quantumEntropyBits,
                    quantumChiBits,
                    quantumAutoBits
                ],
                backgroundColor:"#9b59b6"
            }
        ]
    }

});
    // ---------- DISPLAY ----------

    document.getElementById("classicalEntropy").innerHTML =

    `
    Decimal Entropy: ${classicalEntropyNum}<br>
    Bit Entropy: ${classicalEntropyBits}<br>
    Chi-square (numbers): ${classicalChiNum}<br>
    Chi-square (bits): ${classicalChiBits}<br>
    Autocorrelation (numbers): ${classicalAutoNum}<br>
    Autocorrelation (bits): ${classicalAutoBits}
    `;

    document.getElementById("quantumEntropy").innerHTML =

    `
    Decimal Entropy: ${quantumEntropyNum}<br>
    Bit Entropy: ${quantumEntropyBits}<br>
    Chi-square (numbers): ${quantumChiNum}<br>
    Chi-square (bits): ${quantumChiBits}<br>
    Autocorrelation (numbers): ${quantumAutoNum}<br>
    Autocorrelation (bits): ${quantumAutoBits}
    `;

}
function drawBitGrid(bits){

    const grid = document.getElementById("bitGrid");
    grid.innerHTML = "";

    bits.slice(0,4096).forEach(bit=>{

        const cell = document.createElement("div");

        cell.className = "bit";

        cell.style.backgroundColor =
            bit === 1 ? "#000" : "#fff";

        grid.appendChild(cell);

    });

}
// ================== DOWNLOAD EXCEL ==================

document.getElementById("downloadExcelBtn").onclick = () => {

    if (classicalHistory.length === 0 || quantumHistory.length === 0) {
        alert("Generate numbers first!");
        return;
    }

    fetch("http://127.0.0.1:5000/export-excel", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            classical: classicalHistory,
            quantum: quantumHistory
        })

    })

    .then(response => response.blob())

    .then(blob => {

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;
        a.download = "RNG_Report.xlsx";

        document.body.appendChild(a);

        a.click();

        a.remove();

    })

    .catch(err => console.error(err));

};


//------spreading start here---------

const spreadPage = document.getElementById("spreadPage");

document.getElementById("spreadBtn").onclick = () => {

home.classList.add("hidden");
spreadPage.classList.remove("hidden");

};
document.getElementById("spreadBackBtn").onclick = () => {

spreadPage.classList.add("hidden");
home.classList.remove("hidden");

};
function generateMessage(length = 8){

let message=[]

for(let i=0;i<length;i++){
message.push(Math.round(Math.random()))
}

return message
}

function classicalSpreadingCode(length=4){

let code=[]

for(let i=0;i<length;i++){
code.push(Math.round(Math.random()))
}

return code
}

function spreadSignal(message, code){

let spread=[]

message.forEach(bit=>{

code.forEach(c=>{

spread.push(bit ^ c)

})

})

return spread
}
function addNoise(signal, probability=0.1){

return signal.map(bit=>{

if(Math.random()<probability){
return bit ^ 1
}

return bit

})

}

function despreadSignal(signal, code){

let recovered=[]

for(let i=0;i<signal.length;i+=code.length){

let block=signal.slice(i,i+code.length)

let decoded=block.map((b,j)=>b^code[j])

let ones=decoded.filter(x=>x==1).length

recovered.push(ones>decoded.length/2?1:0)

}

return recovered
}
function errorRate(original,recovered){

let errors=0

for(let i=0;i<original.length;i++){

if(original[i]!=recovered[i]){
errors++
}

}

return errors/original.length
}
document.getElementById("generateMessageBtn").onclick = () => {

let message = generateMessage(8);

document.getElementById("messageBits").innerText =
message.join(" ");

window.currentMessage = message;

};
document.getElementById("runClassicalSpread").onclick = () => {

if(!window.currentMessage){
alert("Generate message first!");
return;
}
let message = window.currentMessage;

let code = classicalSpreadingCode(4);

let spread = spreadSignal(message,code);

let noisy = addNoise(spread,0.1);

let recovered = despreadSignal(noisy,code);

let error = errorRate(message,recovered);

document.getElementById("classicalCode").innerText =
code.join(" ");

document.getElementById("classicalSpread").innerText =
spread.join(" ");

document.getElementById("classicalRecovered").innerText =
recovered.join(" ");

document.getElementById("classicalError").innerText =
error;

};
document.getElementById("runQuantumSpread").onclick = async () => {

let message = window.currentMessage;

let res = await fetch("http://127.0.0.1:5000/quantum/1");

let data = await res.json();

let num = data.random_numbers[0];

let bits = num.toString(2).padStart(8,'0').split("").map(Number);

let code = bits.slice(0,4);

let spread = spreadSignal(message,code);

let noisy = addNoise(spread,0.1);

let recovered = despreadSignal(noisy,code);

let error = errorRate(message,recovered);

document.getElementById("quantumCode").innerText =
code.join(" ");

document.getElementById("quantumSpread").innerText =
spread.join(" ");

document.getElementById("quantumRecovered").innerText =
recovered.join(" ");

document.getElementById("quantumError").innerText =
error;

};