
// ================== DOM REFERENCES ==================
const home = document.getElementById("home");
const rngPage = document.getElementById("rngPage");
const analysisPage = document.getElementById("analysisPage");

const quantumOutput = document.getElementById("quantumOutput");
const classicalOutput = document.getElementById("classicalOutput");

const analysisBackBtn = document.getElementById("analysisBackBtn");

const lotteryBackBtn = document.getElementById("lotteryBackBtn");
// LOTTERY DOM


// ================== DATA STORAGE ==================
let classicalHistory = [];
let quantumHistory = [];

let classicalBinary = [];
let quantumBinary = [];

const MAX_HISTORY = 15;

let classicalBinaryMode = false;
let quantumBinaryMode = false;

let currentMode = "rng";

// ================== NAVIGATION ==================

// nav handled inline
document.getElementById("rngBtn") && (document.getElementById("rngBtn").onclick = null); function unused_red() {
    currentMode = "rng";

    document.querySelector(".quantum h2").innerText = "Quantum RNG (Qiskit)";
    document.querySelector(".classical h2").innerText = "Classical RNG";

    home.classList.add("hidden");
    rngPage.classList.remove("hidden");
};

function unused_blue() {
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

// ================== LOTTERY PAGE NAVIGATION ==================
const lotteryPage = document.getElementById("lotteryPage");
const lotteryBtn = document.getElementById("lotteryHomeBtn") || document.querySelector(".green");

lotteryBtn.onclick = () => {
    home.classList.add("hidden");
    lotteryPage.classList.remove("hidden");
};

lotteryBackBtn.onclick = () => {
    lotteryPage.classList.add("hidden");
    home.classList.remove("hidden");
};

// ================== GRAVITY BALL MACHINE CLASS ==================
class GravityMachine {
    constructor(canvasId, color) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.W = this.canvas.width;
        this.H = this.canvas.height;
        this.color = color;
        this.balls = [];
        this.animId = null;
        this.running = false;
        this.pickedNumber = null;

        this.tubeX = this.W / 2;
        this.tubeY = this.H - 18;
        this.tubeW = 26;
        this.tubeH = 40;
    }

    initBalls(count = 40) {
        this.balls = [];
        const chamberR = 90;
        const cx = this.W / 2;
        const cy = this.H / 2 - 10;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * (chamberR - 14);
            this.balls.push({
                x: cx + Math.cos(angle) * r,
                y: cy + Math.sin(angle) * r,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                r: 9,
                num: Math.floor(Math.random() * 99) + 1,
                escaped: false,
                color: `hsl(${Math.random() * 360}, 80%, 60%)`,
            });
        }
    }

    drawMachine(phase) {
        const ctx = this.ctx;
        const W = this.W, H = this.H;
        const cx = W / 2, cy = H / 2 - 10;
        const R = 92;

        ctx.clearRect(0, 0, W, H);

        // Background glow
        const grd = ctx.createRadialGradient(cx, cy, 10, cx, cy, R);
        grd.addColorStop(0, "rgba(20,20,50,0.9)");
        grd.addColorStop(1, "rgba(5,5,20,0.98)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);

        // Chamber
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R - 2, 0, Math.PI * 2);
        ctx.clip();

        // Spin lines
        if (phase === "spinning") {
            for (let i = 0; i < 8; i++) {
                const a = (Date.now() / 400 + i * Math.PI / 4) % (Math.PI * 2);
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
                ctx.strokeStyle = `rgba(255,255,255,0.04)`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        // Balls
        for (const b of this.balls) {
            if (b.escaped) continue;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);

            const ballGrd = ctx.createRadialGradient(b.x - 2, b.y - 2, 1, b.x, b.y, b.r);
            ballGrd.addColorStop(0, "white");
            ballGrd.addColorStop(0.35, b.color);
            ballGrd.addColorStop(1, "rgba(0,0,0,0.6)");
            ctx.fillStyle = ballGrd;
            ctx.fill();

            ctx.fillStyle = "#fff";
            ctx.font = `bold ${b.r < 10 ? 7 : 8}px monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(b.num, b.x, b.y);
        }

        ctx.restore();

        // Tube
        const tx = cx - this.tubeW / 2;
        const ty = cy + R - 4;
        const tubeGrd = ctx.createLinearGradient(tx, 0, tx + this.tubeW, 0);
        tubeGrd.addColorStop(0, "rgba(80,80,80,0.8)");
        tubeGrd.addColorStop(0.5, "rgba(180,180,180,0.9)");
        tubeGrd.addColorStop(1, "rgba(80,80,80,0.8)");
        ctx.fillStyle = tubeGrd;
        ctx.fillRect(tx, ty, this.tubeW, this.tubeH + 10);

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(tx, ty, this.tubeW, this.tubeH + 10);

        ctx.fillStyle = this.color;
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText("KERALA LOTTERY", cx, 14);
    }

    updateBalls(phase) {
        const cx = this.W / 2;
        const cy = this.H / 2 - 10;
        const R = 80;

        for (const b of this.balls) {
            if (b.escaped) continue;

            if (phase === "spinning") {
                const angle = Math.atan2(b.y - cy, b.x - cx);
                const tangent = angle + Math.PI / 2;
                b.vx += Math.cos(tangent) * 0.35 + (Math.random() - 0.5) * 0.4;
                b.vy += Math.sin(tangent) * 0.35 + (Math.random() - 0.5) * 0.4;
            } else {
                b.vy += 0.25;
                b.vx += (cx - b.x) * 0.008;
            }

            b.vx *= 0.97;
            b.vy *= 0.97;

            b.x += b.vx;
            b.y += b.vy;

            const dx = b.x - cx, dy = b.y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist + b.r > R) {
                const nx = dx / dist, ny = dy / dist;
                const dot = b.vx * nx + b.vy * ny;
                b.vx -= 2 * dot * nx;
                b.vy -= 2 * dot * ny;
                b.x = cx + nx * (R - b.r);
                b.y = cy + ny * (R - b.r);
                b.vx *= 0.8;
                b.vy *= 0.8;
            }

            for (const b2 of this.balls) {
                if (b2 === b || b2.escaped) continue;
                const ddx = b.x - b2.x, ddy = b.y - b2.y;
                const dd = Math.sqrt(ddx * ddx + ddy * ddy);
                if (dd < b.r + b2.r && dd > 0) {
                    const overlap = (b.r + b2.r - dd) / 2;
                    b.x  += (ddx / dd) * overlap;
                    b.y  += (ddy / dd) * overlap;
                    b2.x -= (ddx / dd) * overlap;
                    b2.y -= (ddy / dd) * overlap;
                    const tempVx = b.vx; const tempVy = b.vy;
                    b.vx = b2.vx * 0.85; b.vy = b2.vy * 0.85;
                    b2.vx = tempVx * 0.85; b2.vy = tempVy * 0.85;
                }
            }
        }
    }

    run(onPick) {
        if (this.running) return;
        this.running = true;
        this.pickedNumber = null;

        this.initBalls(40);

        const winnerIdx = Math.floor(Math.random() * this.balls.length);
        const winner = this.balls[winnerIdx];

        let frame = 0;
        const SPIN_FRAMES = 200;
        const EJECT_FRAMES = 55;
        const exitCX = this.W / 2;
        const exitCY = this.H / 2 - 10 + 72;

        const loop = () => {
            frame++;
            const phase = frame < SPIN_FRAMES ? "spinning" : "settling";

            if (phase === "settling") {
                winner.x += (exitCX - winner.x) * 0.13;
                winner.y += (exitCY - winner.y) * 0.13;
                winner.vx *= 0.4;
                winner.vy *= 0.4;
            }

            this.updateBalls(phase);
            this.drawMachine(phase);

            if (frame >= SPIN_FRAMES + EJECT_FRAMES) {
                winner.escaped = true;
                this.pickedNumber = winner.num;
                this.running = false;
                cancelAnimationFrame(this.animId);
                this.drawMachine("done");
                onPick(winner.num);
                return;
            }

            this.animId = requestAnimationFrame(loop);
        };

        this.animId = requestAnimationFrame(loop);
    }

    stop() {
        if (this.animId) cancelAnimationFrame(this.animId);
        this.running = false;
    }
}

// ================== MACHINE INSTANCES ==================
const classicalMachine = new GravityMachine("classicalMachineCanvas", "#00ffcc");
const quantumMachine   = new GravityMachine("quantumMachineCanvas",   "#bf80ff");

// Initial idle draw
setTimeout(() => {
    classicalMachine.initBalls(40);
    classicalMachine.drawMachine("idle");
    quantumMachine.initBalls(40);
    quantumMachine.drawMachine("idle");
}, 300);

// ================== HELPER – Populate grid + SAVE TO HISTORY ==================
function populateNumbersList(elementId, numbers, isQuantum = false) {
    const el = document.getElementById(elementId);
    el.innerHTML = "";

    // SAVE to global history for analysis
    if (isQuantum) {
        quantumHistory = [...numbers];
    } else {
        classicalHistory = [...numbers];
    }

    numbers.forEach((n, i) => {
        const cell = document.createElement("div");
        cell.className = "lottery-num-cell";
        cell.style.animationDelay = `${i * 12}ms`;
        const series = ["BA","BB","BC","BD","BE","BF","BG","BH","BJ","BK"][n % 10];
        cell.textContent = `${series} ${String(n).padStart(2,'0')}`;
        cell.title = `#${i+1}`;
        el.appendChild(cell);
    });
}

// ================== CLASSICAL LOTTERY ==================
document.getElementById("generateClassicalLottery").onclick = () => {
    const btn = document.getElementById("generateClassicalLottery");
    btn.disabled = true;
    btn.textContent = "🎰 Running...";

    classicalMachine.run((pickedNum) => {
        const numbers = [];
        let seed = Date.now() & 0x7fffffff;
        for (let i = 0; i < 200; i++) {
            seed = (seed * 1103515245 + 12345) & 0x7fffffff;
            numbers.push((seed % 99) + 1);
        }
        numbers[0] = pickedNum;

        setTimeout(() => {
            populateNumbersList("classicalNumbersList", numbers, false);
            btn.disabled = false;
            btn.textContent = "▶ Start Machine";
        }, 600);
    });
};

// ================== QUANTUM LOTTERY ==================
document.getElementById("generateQuantumLottery").onclick = () => {
    const btn = document.getElementById("generateQuantumLottery");
    const listEl = document.getElementById("quantumNumbersList");

    btn.disabled = true;
    btn.textContent = "⚛️ Running...";

    // Clear previous results and show loading
    listEl.innerHTML = '<div style="padding: 40px; text-align: center; color: #aaa;">Contacting IBM quantum hardware...<br>This may take 30s–several minutes (or timeout on free tier)</div>';

    quantumMachine.run((pickedNum) => {
        fetch("http://127.0.0.1:5000/quantum/200", { timeout: 120000 })  // 2 min timeout
            .then(r => {
                if (!r.ok) throw new Error(`Backend error: HTTP ${r.status}`);
                return r.json();
            })
            .then(data => {
                if (!data.random_numbers || data.random_numbers.length === 0) {
                    throw new Error("No random numbers returned from quantum backend");
                }
                const numbers = data.random_numbers.map(v => (v % 99) + 1);
                numbers[0] = pickedNum;

                finalizeQuantum(numbers);
            })
            .catch(err => {
                console.error("Quantum fetch failed:", err);
                // Show warning but continue with fallback
                listEl.innerHTML += '<div style="color:#ffcc00; padding:10px; text-align:center;">Quantum backend failed — using fast simulation fallback</div>';

                let x = Date.now() ^ (Math.random() * 0xffffffff | 0);
                const numbers = [];
                for (let i = 0; i < 200; i++) {
                    x ^= x << 13; x ^= x >> 17; x ^= x << 5;
                    numbers.push((Math.abs(x) % 99) + 1);
                }
                numbers[0] = pickedNum;

                finalizeQuantum(numbers);
            });
    });

    function finalizeQuantum(numbers) {
        setTimeout(() => {
            populateNumbersList("quantumNumbersList", numbers, true);
            btn.disabled = false;
            btn.textContent = "▶ Start Machine";
        }, 800);  // slight delay for smooth transition
    }
};

// ================== ANALYZE BUTTON ON LOTTERY PAGE ==================
document.getElementById("lotteryAnalyzeBtn").onclick = () => {
    if (classicalHistory.length === 0 || quantumHistory.length === 0) {
        alert("Please generate lottery results on both sides first!");
        return;
    }

    const btn = document.getElementById("lotteryAnalyzeBtn");
    btn.disabled = true;
    btn.textContent = "Analyzing...";

    // Run analysis with lottery data
    renderAnalysis();

    // Switch to analysis page
    lotteryPage.classList.add("hidden");
    analysisPage.classList.remove("hidden");

    // Reset button text after short delay
    setTimeout(() => {
        btn.disabled = false;
        btn.textContent = "📊 Analyze Lottery Results";
    }, 1500);
};
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