# retrieved from https://stackoverflow.com/questions/19697846/how-to-convert-csv-file-to-multiline-json
import csv
import json

# open csv file in reading mode
csvfile = open('top20.csv', 'r')

# open JSON file in writing mode
jsonfile = open('imf_gdp_json.json', 'w')

fieldnames = ("Country", "GDP_current_prices")

reader = csv.DictReader(csvfile, fieldnames)

# create empty list
data_list = [];

# go over rows in csvfile
for row in reader:

    # append to data list
    data_list.append(row);

data_dict = {'data': data_list[0:]}

# dump to json file in json format
json.dump(data_dict, jsonfile)
