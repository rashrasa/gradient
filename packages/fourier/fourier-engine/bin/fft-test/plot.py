import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

signal_data = pd.read_csv(
    "packages/fourier/fourier-engine/bin/fft-test/result/signal.tsv", 
    sep="\t",
)
fft_data = pd.read_csv(
    "packages/fourier/fourier-engine/bin/fft-test/result/fft.tsv", 
    sep="\t",
)

ax = signal_data.plot.scatter(x="time", y="amplitude")
ax.set_xlim(0.0, 15.0)
ax.set_ylim(-1.5, 1.5)

fft_data.plot.scatter(x="frequency", y="amplitude")

plt.show()