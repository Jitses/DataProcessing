#
# Jitse Schol
# Student Number: 10781463
# Data Processing week 3
#

# Retrieved from https://stackoverflow.com/questions/19697846/how-to-convert-csv-file-to-multiline-json
import csv
import json

# Open csv file in reading mode
csvfile = open('imf_gdp_csv.csv', 'r')

# Open JSON file in writing mode
jsonfile = open('imf_gdp.json', 'w')

# Set fieldnames
fieldnames = ("Country", "GDP")

# Initiate reader
reader = csv.DictReader(csvfile, fieldnames)

# Create empty list
data_list = [];

# Go over rows in csvfile
for row in reader:

    # Append to data list
    data_list.append(row);

# Initiate dictionary
data_dict = {'data': data_list[0:]}

# Dump to json file in json format
json.dump(data_dict, jsonfile)
