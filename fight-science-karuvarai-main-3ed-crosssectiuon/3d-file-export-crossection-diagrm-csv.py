import trimesh
import numpy as np
import csv
import os

# Load your 3D mesh (replace with the actual path to your .obj file)
mesh_file = r"Road_cones.obj"  # Use raw string (r"") to avoid escape character issues

# Ensure that the file exists before trying to load
if not os.path.exists(mesh_file):
    print("Error: The file {} does not exist.".format(mesh_file))
    exit()

try:
    mesh = trimesh.load(mesh_file)

    # If mesh is a Scene, extract the first mesh
    if isinstance(mesh, trimesh.Scene):
        mesh = mesh.dump()[0]  # Take the first mesh from the scene
    print("Mesh loaded successfully: {}".format(mesh))
except Exception as e:
    print("Error loading mesh: {}".format(e))
    exit()

# Function to get cross-section for specified planes
def get_cross_section(mesh, plane, coord_value):
    try:
        # Define plane origin and normal vector based on plane type
        if plane == 'xy':
            section = mesh.section(plane_origin=[0, 0, coord_value], plane_normal=[0, 0, 1])
        elif plane == 'xz':
            section = mesh.section(plane_origin=[0, coord_value, 0], plane_normal=[0, 1, 0])
        elif plane == 'yz':
            section = mesh.section(plane_origin=[coord_value, 0, 0], plane_normal=[1, 0, 0])
        else:
            raise ValueError("Invalid plane: {}. Use 'xy', 'xz', or 'yz'.".format(plane))

        # Check if section is valid
        if section and hasattr(section, 'vertices'):
            return section.vertices
        else:
            print("No intersection found for plane {} at coordinate {}".format(plane, coord_value))
            return np.array([])
    except Exception as e:
        print("Error in getting cross-section for plane {} at {}: {}".format(plane, coord_value, e))
        return np.array([])

# Function to generate and save cross-sections
def save_cross_sections(mesh, step, output_dir):
    # Get the bounding box of the mesh
    min_coord, max_coord = mesh.bounds[0], mesh.bounds[1]
    print("Mesh bounds: min {}, max {}".format(min_coord, max_coord))

    # Ensure the output directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Generate cross-sections for each plane ('xy', 'xz', 'yz')
    for plane in ['xy', 'xz', 'yz']:
        # Ensure the output directory for each plane exists
        plane_output_dir = os.path.join(output_dir, plane)
        if not os.path.exists(plane_output_dir):
            os.makedirs(plane_output_dir)

        # Define slicing range based on the plane
        axis_index = {'xy': 2, 'xz': 1, 'yz': 0}[plane]  # Axis index for z, y, x respectively
        slice_min, slice_max = min_coord[axis_index], max_coord[axis_index]

        # Generate cross-sections
        for coord_value in np.arange(slice_min, slice_max, step):
            section_points = get_cross_section(mesh, plane, coord_value)
            if len(section_points) > 0:
                output_filename = os.path.join(plane_output_dir, "cross_section_{}_{}.csv".format(plane, round(coord_value, 2)))
                
                # Remove `newline=''` argument from open()
                with open(output_filename, 'w') as file:
                    writer = csv.writer(file)
                    writer.writerow(['X', 'Y', 'Z'])  # Header
                    writer.writerows(section_points)  # Write points
                print("Exported cross-section to {}".format(output_filename))
            else:
                print("No points found for {} plane at {:.2f}".format(plane, coord_value))

# Fixed step size (0.2) and output directory
step = 0.002
output_dir = "cross_sections"

# Save cross-sections to separate CSV files
save_cross_sections(mesh, step, output_dir)

