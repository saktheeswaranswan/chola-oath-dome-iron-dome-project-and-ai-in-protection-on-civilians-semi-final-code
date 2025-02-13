import os
import csv
import glob

def combine_csv_files(prefix="cross_section_xz_", output_folder="combined_csv"):
    # Create the output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # Find all CSV files starting with the prefix.
    files = glob.glob(prefix + "*.csv")
    groups = {}

    # Group files based on the first two digits of the integer part of the numeric portion of the filename.
    for file in files:
        base = os.path.basename(file)
        # Extract the number part by removing the prefix and the trailing ".csv"
        number_part = base[len(prefix):-4]
        try:
            num = float(number_part)
            int_part = int(num)
            str_int = str(int_part)
            # Use only the first two digits if the integer part is longer than 2 digits
            group_key = str_int if len(str_int) <= 2 else str_int[:2]
        except ValueError:
            print("Skipping file with invalid number: {}".format(file))
            continue

        if group_key not in groups:
            groups[group_key] = []
        groups[group_key].append(file)

    # For each group, combine the CSV files into one file in the output folder.
    for group_key, file_list in groups.items():
        output_file = os.path.join(output_folder, "combined_cross_section_xz_{}.csv".format(group_key))
        with open(output_file, 'w', newline='') as fout:
            writer = None
            for filename in file_list:
                with open(filename, 'r', newline='') as fin:
                    reader = csv.reader(fin)
                    rows = list(reader)
                    if not rows:
                        continue
                    # Write header only once
                    if writer is None:
                        writer = csv.writer(fout)
                        writer.writerow(rows[0])
                    # Write remaining rows, skipping the header for subsequent files
                    writer.writerows(rows[1:])
        print("Combined {} file(s) into {}".format(len(file_list), output_file))

if __name__ == "__main__":
    combine_csv_files()

