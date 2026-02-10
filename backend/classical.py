# classical.py
# Linear Congruential Generator (LCG)

class LCG:
    def __init__(self, seed=123456):
        self.m = 2**31
        self.a = 1103515245
        self.c = 12345
        self.state = seed

    def generate(self):
        self.state = (self.a * self.state + self.c) % self.m
        return self.state
