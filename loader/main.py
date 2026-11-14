import json
import requests
import os
import threading

from fastapi import FastAPI
from turntable_video import generate_video



projects_url = 'https://raw.githubusercontent.com/ToxSam/open-source-3d-assets/main/data/projects.json'
assets_url = 'https://raw.githubusercontent.com/ToxSam/open-source-3d-assets/main/data/'

json_directory = '../data/json'
preview_directory = '../data/preview'

os.makedirs(json_directory, exist_ok=True)
os.makedirs(preview_directory, exist_ok=True)

def download_file(url, file_path):
    response = requests.get(url)
    if response.status_code == 200:
        with open(file_path, 'wb') as file:
            file.write(response.content)
        print(f'File {file_path} downloaded successfully')
    else:
        print('Failed to download file')
    return file_path

def load_json(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data


projects_data = {}
assets_data = {}

app = FastAPI()

video_lock = threading.Lock()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/projects")
async def get_projects():
    file_path = download_file(projects_url, json_directory + '/projects.json')
    projects = load_json(file_path)
    for project in projects:
        projects_data[project['name']] = {
        'description': project['description'],
        'url': assets_url + project['asset_data_file']
    }
    return projects_data

@app.post("/assets")
def select_project(name: str):
    global assets_data
    url = projects_data[name]['url']
    file_path = download_file(url, json_directory + '/' + os.path.basename(url))
    assets = load_json(file_path)
    assets_data = {}
    for asset in assets:
        assets_data[asset['name']] = {
            'description' : asset['description'],
            'thumbnail_url' : asset['thumbnail_url'],
            'url' : asset['model_file_url']
        }
    return assets_data

@app.post("/model")
def select_model(name: str):
    with video_lock:
        video = generate_video(assets_data[name]['url'], preview_directory)
    content = {
        "url" : assets_data[name]['url'],
        "preview" : video
    }
    return content