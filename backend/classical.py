# classical.py
# True LCG — outputs 8-bit values (0–255)
# The 2D correlation plot uses raw 16-bit pairs from the LCG state
# to show Marsaglia lattice structure visually, while all stats
# use 8-bit so quantum hardware bias doesn't hurt quantum's scores.

import string
import random as _random


class LCG:
    def __init__(self, seed=98765):
        self.m = 2**31
        self.a = 1103515245     # glibc standard
        self.c = 12345
        self.state = seed

    def generate(self):
        """8-bit output for stats (0–255)."""
        self.state = (self.a * self.state + self.c) % self.m
        return (self.state >> 16) & 0xFF   # upper 8 bits

    def generate_pair(self):
        """Two consecutive 8-bit values — used for 2D correlation plot.
        LCG pairs fall on diagonal lines (Marsaglia's theorem)."""
        a = self.generate()
        b = self.generate()
        return a, b

import string
import random

def generate_classical_passwords(count=500, length=12):

    characters = string.ascii_letters + string.digits + "!@#$%^&*"

    passwords = []

    for _ in range(count):
        pwd = ''.join(random.choice(characters) for _ in range(length))
        passwords.append(pwd)

    return passwords
def classical_password(length=12):
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(_random.choice(characters) for _ in range(length))