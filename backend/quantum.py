# quantum.py

from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler
import os
import random

# Connect once when file loads
service = QiskitRuntimeService(
    channel="ibm_quantum_platform",
    token="4eqv3arX6IsNKadXclyb2plDBVEYLycDiItxGsFC33By"
    
)

backend = service.least_busy(simulator=False, operational=True)


def quantum_random_numbers(count=500):
    """
    Generate 'count' quantum random numbers using real IBM hardware
    """

    qc = QuantumCircuit(8, 8)

    # Put qubits in superposition
    for i in range(8):
        qc.h(i)

    qc.measure(range(8), range(8))

    # Transpile for real backend
    qc_transpiled = transpile(qc, backend)

    # Run ONE job with 'count' shots
    sampler = Sampler(backend)
    job = sampler.run([qc_transpiled], shots=count)

    print(f"Job submitted: {job.job_id()}")
    print("Waiting for IBM hardware...")

    result = job.result()
    counts = result[0].data.c.get_counts()

    numbers = []

    for bitstring, freq in counts.items():
        number = int(bitstring, 2)
        numbers.extend([number] * freq)

    # 🔥 IMPORTANT FIX — restore randomness order
    random.shuffle(numbers)

    return numbers