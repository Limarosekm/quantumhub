from quantum import quantum_random_number
from flask import Flask, jsonify
from flask_cors import CORS
from classical import LCG

app = Flask(__name__)
CORS(app)   # <-- THIS LINE FIXES CORS


lcg = LCG(seed=98765)

@app.route("/")
def home():
    return "Backend running"

@app.route("/classical")
def classical_rng():
    number = lcg.generate()
    return jsonify({
        "method": "Linear Congruential Generator",
        "random_number": number
    })
@app.route("/quantum")
def quantum_rng():
    number = quantum_random_number()
    return jsonify({
        "method": "Quantum Random Number Generator (Qiskit)",
        "random_number": number
    })

if __name__ == "__main__":
    app.run(debug=True)
