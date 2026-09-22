import pandas as pd

# Name of the 1GB OECD file you downloaded
massive_file = "oecd_stan_database.csv" # Update this to the actual file name

# The exact ISO codes needed for the Macro view
target_countries = ['USA', 'SGP', 'JPN', 'DEU', 'ZAF', 'BRA', 'IND']

# Read the massive file in chunks of 50,000 rows to save RAM
chunk_size = 50000
filtered_chunks = []

print("Processing 1GB file...")

for chunk in pd.read_csv(massive_file, chunksize=chunk_size, low_memory=False):
    # Filter for target countries and ICT Manufacturing / Employment
    # (Note: adjust the exact column names based on the OECD file's headers)
    target_data = chunk[
        (chunk['REF_AREA'].isin(target_countries)) & 
        (chunk['Economic activity'].str.contains('ICT', na=False, case=False)) &
        (chunk['Measure'].str.contains('employment', na=False, case=False))
    ]
    
    if not target_data.empty:
        filtered_chunks.append(target_data)

# Combine the surviving rows
final_df = pd.concat(filtered_chunks)

# Output the clean, summarized data to view it
print("\nExtraction complete! Here are the surviving rows:")
print(final_df[['Reference area', 'Economic activity', 'OBS_VALUE']].head(20))

# From here, you can take these OBS_VALUE (headcount) numbers 
# and type them directly into your macro_global_talent.csv template.