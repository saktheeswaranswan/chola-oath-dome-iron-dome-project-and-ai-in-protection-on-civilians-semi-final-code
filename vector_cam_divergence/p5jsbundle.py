# -*- coding: utf-8 -*-
import os
import shutil
import zipfile

# Define the base project structure
project_name = "p5jsAndroidApp"
base_dir = os.path.join(os.getcwd(), project_name)

folders = [
    "app/src/main/java/com/example/p5jsandroidapp",
    "app/src/main/res/layout",
    "app/src/main/assets"
]

# Create directory structure
for folder in folders:
    os.makedirs(os.path.join(base_dir, folder), exist_ok=True)

# Sample files (Replace with actual paths if needed)
files_to_bundle = {
    "vector_cam_divergence.js": "app/src/main/assets/vector_cam_divergence.js",
    "index.html": "app/src/main/assets/index.html",
    "sketch.properties": "app/src/main/assets/sketch.properties"
}

# Copy the files
for src_file, dest_path in files_to_bundle.items():
    if os.path.exists(src_file):
        shutil.copy(src_file, os.path.join(base_dir, dest_path))
    else:
        with open(os.path.join(base_dir, dest_path), "w") as f:
            f.write("// Placeholder: Add your content here")

# Zip the project for easy import
zip_filename = "{}.zip".format(project_name)
zip_path = os.path.join(os.getcwd(), zip_filename)

with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, _, files in os.walk(base_dir):
        for file in files:
            file_path = os.path.join(root, file)
            zipf.write(file_path, os.path.relpath(file_path, base_dir))

print("Android Studio project bundled successfully: {}".format(zip_path))

