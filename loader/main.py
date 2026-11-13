import json
import requests


projects_url = 'https://raw.githubusercontent.com/ToxSam/open-source-3d-assets/main/data/projects.json'
assets_url = 'https://github.com/ToxSam/open-source-3D-assets/tree/main/data/'

def download_file(url, file_path):
    response = requests.get(url)
    if response.status_code == 200:
        with open(file_path, 'wb') as file:
            file.write(response.content)
        print(f'File {file_path} downloaded successfully')
    else:
        print('Failed to download file')

def load_json(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

def print_keys(data, keys):
    for item in data:
        for key in keys:
            if key in item:
                print(f'{key}: {item[key]}')
        print('---')

def get_project(projects, project_name):
    for project in projects:
        if project['name'] == project_name:
            return project
    return None

def get_asset_json(project):
    asset_url = assets_url + project["asset_data_file"]
    print(f'Downloading : {asset_url}')
    download_file(asset_url, project["id"] + ".json")

projects = load_json('projects.json')

print_keys(projects, ['name', 'description'])

selected_project = input('Enter the name of the project you want to select: ')
project = get_project(projects, selected_project)

print(project["github_url"])

get_asset_json(project)

