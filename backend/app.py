from quantum import quantum_random_numbers
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from classical import LCG

import math
from collections import Counter
from openpyxl import Workbook
from openpyxl.chart import BarChart, Reference

app = Flask(__name__)
CORS(app)

lcg = LCG(seed=98765)


@app.route("/")
def home():
    return "Backend running"


# ================= CLASSICAL RNG =================

@app.route("/classical/<int:count>")
def classical_rng(count):

    numbers = [lcg.generate() for _ in range(count)]

    return jsonify({
        "method": "Mersenne Twister",
        "random_numbers": numbers
    })


# ================= QUANTUM RNG =================

@app.route("/quantum/<int:count>")
def quantum_rng(count):

    numbers = quantum_random_numbers(count)

    return jsonify({
        "method": "Quantum Random Number Generator (IBM Hardware)",
        "random_numbers": numbers
    })


# ================= EXCEL EXPORT =================

@app.route("/export-excel", methods=["POST"])
def export_excel():

    data = request.get_json()

    classical_numbers = data["classical"]
    quantum_numbers = data["quantum"]

    COUNT = len(classical_numbers)
    MAX_VALUE = 255

    # ---------- METRICS ----------

    def entropy(data):
        freq = Counter(data)
        total = len(data)
        H = 0

        for count in freq.values():
            p = count / total
            H -= p * math.log2(p)

        return round(H, 5)

    def chi_square(data):
        freq = Counter(data)
        expected = len(data) / (MAX_VALUE + 1)

        chi = 0

        for value in range(MAX_VALUE + 1):

            observed = freq.get(value, 0)

            chi += ((observed - expected) ** 2) / expected

        return round(chi, 5)

    # ---------- WORKBOOK ----------

    wb = Workbook()

    # ---------- RAW DATA ----------

    ws1 = wb.active
    ws1.title = "Random_Numbers"

    ws1["A1"] = "Classical"
    ws1["B1"] = "Quantum"

    for i in range(COUNT):

        ws1.cell(row=i+2, column=1, value=classical_numbers[i])
        ws1.cell(row=i+2, column=2, value=quantum_numbers[i])

    # ---------- ANALYSIS ----------

    ws2 = wb.create_sheet("Analysis")

    ws2.append(["Metric","Classical","Quantum"])

    ws2.append(["Total Numbers", COUNT, COUNT])

    ws2.append(["Entropy",
                entropy(classical_numbers),
                entropy(quantum_numbers)])

    ws2.append(["Chi-Square",
                chi_square(classical_numbers),
                chi_square(quantum_numbers)])

    # ---------- FREQUENCY ----------

    ws3 = wb.create_sheet("Frequency")

    ws3.append(["Value","Classical","Quantum"])

    classical_freq = Counter(classical_numbers)
    quantum_freq = Counter(quantum_numbers)

    for i in range(MAX_VALUE + 1):

        ws3.append([
            i,
            classical_freq.get(i,0),
            quantum_freq.get(i,0)
        ])

    # ---------- CHART ----------

    chart = BarChart()

    chart.title = "Distribution Comparison"

    data = Reference(ws3,
                     min_col=2,
                     min_row=1,
                     max_row=MAX_VALUE+2,
                     max_col=3)

    cats = Reference(ws3,
                     min_col=1,
                     min_row=2,
                     max_row=MAX_VALUE+2)

    chart.add_data(data, titles_from_data=True)
    chart.set_categories(cats)

    ws3.add_chart(chart,"E2")

    # ---------- SAVE ----------

    file_path = "RNG_Report.xlsx"

    wb.save(file_path)

    return send_file(file_path, as_attachment=True)


# ================= RUN SERVER =================

if __name__ == "__main__":
    app.run(debug=True)