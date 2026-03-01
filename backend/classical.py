

# classical.py
# Linear Congruential Generator (LCG)

import random
import string


class LCG:
    def __init__(self, seed=123456):
        self.m = 2**31
        self.a = 1103515245
        self.c = 12345
        self.state = seed

    def generate(self):
        # Standard LCG step
        self.state = (self.a * self.state + self.c) % self.m
        
        # Convert to 8-bit number (0–255)
        return self.state % 256


def classical_password(length=12):
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.choice(characters) for _ in range(length))