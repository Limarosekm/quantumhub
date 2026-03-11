from quantum import quantum_random_numbers
from flask import Flask, jsonify
from flask_cors import CORS
from classical import LCG

app = Flask(__name__)
CORS(app)

lcg = LCG(seed=98765)


@app.route("/")
def home():
    return "Backend running"


@app.route("/classical/<int:count>")
def classical_rng(count):
    numbers = [lcg.generate() for _ in range(count)]
    return jsonify({
        "method": "Mersenne Twister",
        "random_numbers": numbers
    })


@app.route("/quantum/<int:count>")
def quantum_rng(count):
    numbers = quantum_random_numbers(count)
    return jsonify({
        "method": "Quantum Random Number Generator (IBM Hardware)",
        "random_numbers": numbers
    })


if __name__ == "__main__":
    app.run(debug=True)
    from flask import request

@app.route("/export-excel", methods=["POST"])
def export_excel():

    data = request.get_json()

    classical_numbers = data["classical"]
    quantum_numbers = data["quantum"]

    COUNT = len(classical_numbers)
    MAX_VALUE = 500

    import math
    from collections import Counter
    from openpyxl import Workbook
    from openpyxl.chart import BarChart, Reference

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

    wb = Workbook()

    # RAW DATA
    ws1 = wb.active
    ws1.title = "Raw_Data"
    ws1["A1"] = "Classical RNG"
    ws1["B1"] = "Quantum RNG"

    for i in range(COUNT):
        ws1.cell(row=i+2, column=1, value=classical_numbers[i])
        ws1.cell(row=i+2, column=2, value=quantum_numbers[i])

    # ANALYSIS
    ws2 = wb.create_sheet("Analysis")

    ws2["A1"] = "Metric"
    ws2["B1"] = "Classical"
    ws2["C1"] = "Quantum"

    ws2["A2"] = "Total Numbers"
    ws2["B2"] = COUNT
    ws2["C2"] = COUNT

    ws2["A3"] = "Entropy"
    ws2["B3"] = entropy(classical_numbers)
    ws2["C3"] = entropy(quantum_numbers)

    ws2["A4"] = "Chi-Square"
    ws2["B4"] = chi_square(classical_numbers)
    ws2["C4"] = chi_square(quantum_numbers)

    # SAVE
    file_path = "RNG_Report.xlsx"
    wb.save(file_path)

    from flask import send_file
    return send_file(file_path, as_attachment=True)

    COUNT = 500
    MAX_VALUE = 255

    classical_numbers = [lcg.generate() % 256 for _ in range(COUNT)]
    quantum_numbers = [quantum_random_number() % 256 for _ in range(COUNT)]

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

    wb = Workbook()

    # RAW DATA
    ws1 = wb.active
    ws1.title = "Raw_Data"
    ws1["A1"] = "Classical RNG"
    ws1["B1"] = "Quantum RNG"

    for i in range(COUNT):
        ws1.cell(row=i+2, column=1, value=classical_numbers[i])
        ws1.cell(row=i+2, column=2, value=quantum_numbers[i])

    # ANALYSIS
    ws2 = wb.create_sheet("Analysis")

    ws2["A1"] = "Metric"
    ws2["B1"] = "Classical"
    ws2["C1"] = "Quantum"

    ws2["A2"] = "Total Numbers"
    ws2["B2"] = COUNT
    ws2["C2"] = COUNT

    ws2["A3"] = "Entropy"
    ws2["B3"] = entropy(classical_numbers)
    ws2["C3"] = entropy(quantum_numbers)

    ws2["A4"] = "Chi-Square"
    ws2["B4"] = chi_square(classical_numbers)
    ws2["C4"] = chi_square(quantum_numbers)

    ws2["A6"] = "Higher entropy (~8 for 8-bit) = better randomness"
    ws2["A7"] = "Lower Chi-Square = closer to uniform distribution"

    # FREQUENCY TABLE
    ws3 = wb.create_sheet("Frequency")

    ws3["A1"] = "Value"
    ws3["B1"] = "Classical_Freq"
    ws3["C1"] = "Quantum_Freq"

    classical_freq = Counter(classical_numbers)
    quantum_freq = Counter(quantum_numbers)

    for i in range(MAX_VALUE + 1):
        ws3.cell(row=i+2, column=1, value=i)
        ws3.cell(row=i+2, column=2, value=classical_freq.get(i, 0))
        ws3.cell(row=i+2, column=3, value=quantum_freq.get(i, 0))

    # BAR CHARTS
    chart = BarChart()
    chart.title = "Classical Distribution"
    data = Reference(ws3, min_col=2, min_row=1, max_row=MAX_VALUE+2)
    cats = Reference(ws3, min_col=1, min_row=2, max_row=MAX_VALUE+2)
    chart.add_data(data, titles_from_data=True)
    chart.set_categories(cats)
    ws3.add_chart(chart, "E2")

    chart2 = BarChart()
    chart2.title = "Quantum Distribution"
    data2 = Reference(ws3, min_col=3, min_row=1, max_row=MAX_VALUE+2)
    chart2.add_data(data2, titles_from_data=True)
    chart2.set_categories(cats)
    ws3.add_chart(chart2, "E20")

    file_path = "RNG_Report.xlsx"
    wb.save(file_path)

    return send_file(file_path, as_attachment=True)


if __name__ == "__main__":
    app.run(debug=True)