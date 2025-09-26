import numpy as np

years = np.array([1939, 1940, 1941, 1942])
revenues = np.array([2.189, 2.125, 3.470, 7.960])

slope, intercept = np.polyfit(years, revenues, 1)
predicted_2000 = slope * 2000 + intercept
actual_2000 = 1004.461
difference = actual_2000 - predicted_2000
print(round(difference, 2))
