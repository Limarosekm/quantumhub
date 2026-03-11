# classical.py
# Now using Mersenne Twister (Python's default PRNG)

import random
import string


class LCG:
    def __init__(self, seed=123456):
        # Keep variables so nothing breaks
        self.m = 2**31
        self.a = 1103515245
        self.c = 12345
        self.state = seed

        # Initialize Mersenne Twister with same seed
        random.seed(seed)

    def generate(self):
        # Generate 8-bit number (0–255)
        return random.randint(0, 255)


def classical_password(length=12):
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.choice(characters) for _ in range(length))