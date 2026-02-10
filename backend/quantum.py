# quantum.py
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

def quantum_random_number(bits=8):
    """
    Generates a quantum random number using superposition
    """

    qc = QuantumCircuit(bits, bits)

    # Put all qubits into superposition
    for i in range(bits):
        qc.h(i)

    # Measure all qubits
    qc.measure(range(bits), range(bits))

    simulator = AerSimulator()
    result = simulator.run(qc, shots=1).result()
    counts = result.get_counts()

    bitstring = list(counts.keys())[0]

    return int(bitstring, 2)
