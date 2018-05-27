#!/usr/bin/env python
# Retrieved from https://data.mprog.nl/course/30%20Homework/30%20Scraping/tvscraper.py
# Name: Jitse Schol
# Student number: 10781463

"""
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'

def extract_tvseries(dom):
    """
    Extract a list of highest rated TV series from DOM (of IMDB page).
    Each TV series entry should contain the following fields:
    - TV Title
    - Rating
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """

    # Initialize empty arrays
    imdb_array = []
    title_array = []
    rating_array = []
    genre_array = []
    stars_array = []
    runtime_array = []
    movie_array = []

    # Find lister-item-content
    movies = dom.find_all('div', class_="lister-item-content")

    # Iterate over every movie
    for movie in movies:

        # Save title
        title = movie.a.text

        # Append title to titles array
        # https://stackoverflow.com/questions/9347419/python-strip-with-n
        title_array.append(title.strip('\n').strip(' '))

        # https://stackoverflow.com/questions/5041008/how-to-find-elements-by-class
        rating = movie.find('div', class_="inline-block ratings-imdb-rating")
        rating = rating.text

        # https://stackoverflow.com/questions/9347419/python-strip-with-n
        rating_array.append(rating.strip('\n').strip(' '))

        # Find genre
        genre = movie.find('span', class_="genre")
        genre = genre.text

        # https://stackoverflow.com/questions/9347419/python-strip-with-n
        genre_array.append(genre.strip('\n').strip(' '))

        # Find cast
        cast = movie.find_all('p')
        for paragraph in cast:
            paragraph = paragraph.find_all('a')
            for star in paragraph:

                # If unequal to no info
                if star != []:
                    star = star.text

                    # One part of the text was see full summary, therefore the check
                    if star != "See full summary":

                        # https://stackoverflow.com/questions/9347419/python-strip-with-n
                        stars_array.append(star.strip('\n').strip(' '))

        # Get runtime
        runtime = movie.find('span', class_="runtime")
        runtime = runtime.text

        # Remove "min" from runtime
        # https://stackoverflow.com/questions/9347419/python-strip-with-n
        runtime = runtime[0:3].strip('\n').strip(' ')

        runtime_array.append(runtime)

        # https://stackoverflow.com/questions/16621498/how-to-append-multiple-items-in-one-line-in-python
        movie_array.extend((title_array, rating_array, genre_array, stars_array, runtime_array))

        # Append the movie info to the imdb array
        imdb_array.append(movie_array)

        # Empty arrays for next movie
        title_array = []
        rating_array = []
        genre_array = []
        stars_array = []
        runtime_array = []
        movie_array = []

    return imdb_array


def save_csv(outfile, tvseries):
    """
    Output a CSV file containing highest rated TV-series.
    """

    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])

    for item in tvseries:

        # https://stackoverflow.com/questions/13207697/how-to-remove-square-brackets-from-list-in-python
        writer.writerow([item[0][0], item[1][0], ", ".join(item[2]), ", ".join(item[3]), item[4][0]])


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, tvseries)
