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
const MAX_HISTORY = 15;

// ================== NAVIGATION LOGIC ==================

// Open split screen
document.querySelector(".red").onclick = () => {
    home.classList.add("hidden");
    rngPage.classList.remove("hidden");
};

// Back to home
document.getElementById("backBtn").onclick = () => {
    rngPage.classList.add("hidden");
    home.classList.remove("hidden");

    quantumOutput.innerText = "---";
    classicalOutput.innerText = "---";
};

// Open analysis page
document.getElementById("analyzeBtn").onclick = () => {
    rngPage.classList.add("hidden");
    analysisPage.classList.remove("hidden");
    renderAnalysis();
};

// Back to split screen from analysis
analysisBackBtn.onclick = () => {
    analysisPage.classList.add("hidden");
    rngPage.classList.remove("hidden");
};

// ================== RANDOM NUMBER GENERATION ==================

// Quantum RNG
document.querySelector(".quantum .generate").onclick = () => {
    fetch("http://127.0.0.1:5000/quantum")
        .then(res => res.json())
        .then(data => {
            const num = data.random_number;
            quantumOutput.innerText = num;

            quantumHistory.push(num);
            if (quantumHistory.length > MAX_HISTORY) {
                quantumHistory.shift();
            }
        })
        .catch(err => console.error(err));
};

// Classical RNG
document.querySelector(".classical .generate").onclick = () => {
    fetch("http://127.0.0.1:5000/classical")
        .then(res => res.json())
        .then(data => {
            const num = data.random_number;
            classicalOutput.innerText = num;

            classicalHistory.push(num);
            if (classicalHistory.length > MAX_HISTORY) {
                classicalHistory.shift();
            }
        })
        .catch(err => console.error(err));
};

// ================== ANALYSIS HELPERS ==================

// Histogram (frequency count)
function buildHistogram(data) {
    const freq = {};
    data.forEach(n => {
        freq[n] = (freq[n] || 0) + 1;
    });
    return freq;
}

// Shannon Entropy (STANDARD)
function entropy(data) {
    if (data.length === 0) return "0.000";

    const freq = buildHistogram(data);
    const total = data.length;

    let H = 0;
    for (let k in freq) {
        const p = freq[k] / total;
        H -= p * Math.log2(p);
    }
    return H.toFixed(3);
}

// ================== ANALYSIS RENDERING ==================

function renderAnalysis() {

    // Clear old charts (prevents overlap)
    document.getElementById("classicalChart").replaceWith(
        document.getElementById("classicalChart").cloneNode()
    );
    document.getElementById("quantumChart").replaceWith(
        document.getElementById("quantumChart").cloneNode()
    );

    const classicalChart = document.getElementById("classicalChart");
    const quantumChart = document.getElementById("quantumChart");

    const classicalFreq = buildHistogram(classicalHistory);
    const quantumFreq = buildHistogram(quantumHistory);

    // Classical Histogram
    new Chart(classicalChart, {
        type: "bar",
        data: {
            labels: Object.keys(classicalFreq),
            datasets: [{
                label: "Frequency",
                data: Object.values(classicalFreq),
                backgroundColor: "#2ecc71"
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });

    // Quantum Histogram
    new Chart(quantumChart, {
        type: "bar",
        data: {
            labels: Object.keys(quantumFreq),
            datasets: [{
                label: "Frequency",
                data: Object.values(quantumFreq),
                backgroundColor: "#9b59b6"
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });

    // Entropy display
    document.getElementById("classicalEntropy").innerText =
        "Entropy: " + entropy(classicalHistory);

    document.getElementById("quantumEntropy").innerText =
        "Entropy: " + entropy(quantumHistory);
}
