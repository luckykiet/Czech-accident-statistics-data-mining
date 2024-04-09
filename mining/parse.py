# pip install bs4
# input data is .xls which is HTML table format, so we need to parse them using BeautifulSoup

import numpy as np
import os
import argparse
import csv
from bs4 import BeautifulSoup
import dictionary


def parse_file(filename):
    try:
        print(f'Reading "{filename}" ...')
        # Read HTML file
        file_path = os.path.join("input", filename)
        with open(file_path, "r", encoding="windows-1250") as file:
            data = file.read()

        # Parse HTML using BeautifulSoup
        soup = BeautifulSoup(data, "lxml")

        # Extract table data
        table = soup.find("table")
        if not table:
            raise Exception("No table found in the HTML.")

        # Extract column headers
        headers = [header.get_text(strip=True) for header in table.find_all("th")]
        translated = []

        for header in headers:
            translated_header = dictionary.get(header, {}).get("label", header)
            if translated_header == header:
                translated_header = header
            translated.append(translated_header)

        # Initialize lists to store the extracted data
        extracted_data = []
        rows = []

        # Extract rows
        for row in table.find_all("tr"):
            row_data = []
            for index, value in enumerate(
                [data.get_text(strip=True) for data in row.find_all("td")]
            ):
                if index >= len(headers):
                    continue
                header = headers[index]
                dictionary_item = dictionary.get(header)

                # Formatting step
                if (
                    dictionary_item
                    and not dictionary_item.get("skipIntParse")
                    and value.isdigit()
                ):
                    formatted = int(value)
                else:
                    formatted = value

                if dictionary_item and isinstance(dictionary_item, dict):
                    items = dictionary_item.get("items")
                    if items and isinstance(items, dict) and items.get(str(formatted)):
                        row_data.append(items.get(str(formatted)))
                    else:
                        # Use formatted value
                        row_data.append(formatted)
                else:
                    row_data.append(formatted)  # Use formatted value
            extracted_data.append(row_data)
            rows.append(len(row_data))  # Store the length of each row

        # Remove the first row if it's empty
        if extracted_data and not extracted_data[0]:
            extracted_data.pop(0)
            rows.pop(0)

        # Ensure that all rows have the same length
        for i, row in enumerate(extracted_data):
            while len(row) < len(translated):
                row.append("")
            if len(row) > len(headers):
                rows[i] = row[: len(headers)]
                print(rows[i])

        # Convert the extracted data to a NumPy array
        extracted_data = np.array(extracted_data)

        # Write data to CSV
        output_folder = "output"
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)

        # Write data to CSV in the output folder
        output_filename = os.path.join(
            output_folder, os.path.splitext(os.path.basename(filename))[0] + ".csv"
        )

        with open(output_filename, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile, delimiter=";")
            writer.writerow(translated)
            writer.writerows(extracted_data)

        print(f'File "{output_filename}" created!')

    except Exception as e:
        print(f"Error: {e}")


def parse_file_raw(filename):
    try:
        print(f'Reading "{filename}" ...')
        # Read HTML file
        file_path = os.path.join("input", filename)
        with open(file_path, "r", encoding="windows-1250") as file:
            data = file.read()

        # Parse HTML using BeautifulSoup
        soup = BeautifulSoup(data, "lxml")

        # Extract table data
        table = soup.find("table")
        if not table:
            raise Exception("No table found in the HTML.")

        # Extract column headers
        headers = [header.get_text(strip=True) for header in table.find_all("th")]
        # Initialize lists to store the extracted data
        rows = []

        # Extract rows
        for row in table.find_all("tr"):
            rows.append([data.get_text(strip=True) for data in row.find_all("td")])

        # Remove the first row if it's empty
        if rows and not rows[0]:
            rows.pop(0)
        # Ensure that all rows have the same length as the header row

        for i, row in enumerate(rows):
            while len(row) < len(headers):
                row.append("")
            if len(row) > len(headers):
                rows[i] = row[: len(headers)]

        extracted_data = np.array(rows)

        # Write data to CSV
        output_folder = "output"
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)

        # Write data to CSV in the output folder
        output_filename = os.path.join(
            output_folder,
            os.path.splitext(os.path.basename(filename))[0] + "_raw" + ".csv",
        )

        with open(output_filename, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile, delimiter=";")
            writer.writerow(headers)
            writer.writerows(extracted_data)

        print(f'File "{output_filename}" created!')

    except Exception as e:
        print(f"Error: {e}")


def process_arguments():
    parser = argparse.ArgumentParser(description="Process some files.")
    parser.add_argument("files", nargs="+", help="list of files to parse")
    parser.add_argument("-raw", action="store_true", help="parse files in raw mode")

    args = parser.parse_args()

    if args.raw:
        for filename in args.files:
            parse_file_raw(filename)
    else:
        for filename in args.files:
            parse_file(filename)

    print("Completed")


process_arguments()
