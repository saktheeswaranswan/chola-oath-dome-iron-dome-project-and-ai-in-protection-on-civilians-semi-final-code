import trimesh
import numpy as np
import csv
import os

def load_mesh(mesh_file):
    """
    Loads a 3D mesh from the given file.
    
    If the file contains a Scene, the first mesh is extracted.
    
    :param mesh_file: Path to the mesh file (e.g., .obj)
    :return: A trimesh.Trimesh object if successful, otherwise None.
    """
    if not os.path.exists(mesh_file):
        print("Error: The file {} does not exist.".format(mesh_file))
        return None
    try:
        mesh = trimesh.load(mesh_file)
        if isinstance(mesh, trimesh.Scene):
            # Extract the first geometry from a Scene
            mesh = mesh.dump()[0]
        print("Mesh loaded successfully.")
        return mesh
    except Exception as e:
        print("Error loading mesh: {}".format(e))
        return None

def get_cross_section(mesh, plane, coord_value):
    """
    Extracts the cross-section of the mesh along a specified plane
    at a given coordinate value.
    
    :param mesh: The input 3D mesh (trimesh.Trimesh)
    :param plane: Slicing plane identifier ('xy', 'xz', or 'yz')
    :param coord_value: The coordinate at which to slice
    :return: A numpy array of cross-section vertices (n x 3) or an empty array if no section.
    """
    try:
        if plane == 'xy':
            # Slice along the z-axis (fix z=coord_value)
            section = mesh.section(plane_origin=[0, 0, coord_value], plane_normal=[0, 0, 1])
        elif plane == 'xz':
            # Slice along the y-axis (fix y=coord_value)
            section = mesh.section(plane_origin=[0, coord_value, 0], plane_normal=[0, 1, 0])
        elif plane == 'yz':
            # Slice along the x-axis (fix x=coord_value)
            section = mesh.section(plane_origin=[coord_value, 0, 0], plane_normal=[1, 0, 0])
        else:
            print("Invalid plane specified: {}. Use 'xy', 'xz', or 'yz'.".format(plane))
            return np.array([])
        
        if section is not None and hasattr(section, 'vertices') and section.vertices is not None:
            # Return the vertices as a numpy array
            return np.array(section.vertices)
        else:
            print("No cross-section found for plane {} at coordinate {}.".format(plane, coord_value))
            return np.array([])
    except Exception as e:
        print("Error extracting cross-section for plane {} at {}: {}".format(plane, coord_value, e))
        return np.array([])

def save_cross_sections(mesh, step, output_dir):
    """
    Extracts and saves cross-sections for each of the three primary planes.
    
    For each plane ('xy', 'xz', 'yz'), the function determines the
    corresponding slicing axis based on the mesh's bounding box. It then
    iterates from the minimum to the maximum coordinate (with the given step)
    and saves any valid cross-section points to a CSV file in a dedicated directory.
    
    :param mesh: The input 3D mesh (trimesh.Trimesh)
    :param step: Step size for slicing along the coordinate axis (e.g., 0.2)
    :param output_dir: Directory where CSV files will be saved.
    """
    # Get the mesh's bounding box (min and max coordinates)
    min_coord, max_coord = mesh.bounds[0], mesh.bounds[1]
    print("Mesh bounds: min {}, max {}".format(min_coord, max_coord))
    
    # Create the output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Mapping of plane to the axis index along which we slice
    plane_axis = {'xy': 2, 'xz': 1, 'yz': 0}
    
    for plane, axis_index in plane_axis.items():
        slice_min = min_coord[axis_index]
        slice_max = max_coord[axis_index]
        # Create a sub-directory for the current plane
        plane_output_dir = os.path.join(output_dir, plane)
        if not os.path.exists(plane_output_dir):
            os.makedirs(plane_output_dir)
        print("\nProcessing plane '{}' from {} to {} with step {}".format(plane, slice_min, slice_max, step))
        
        # Loop over the coordinate range; include slice_max by adding the step
        for coord_value in np.arange(slice_min, slice_max + step, step):
            points = get_cross_section(mesh, plane, coord_value)
            if points.size > 0:
                filename = os.path.join(plane_output_dir, "cross_section_{}_{}.csv".format(plane, round(coord_value, 2)))
                try:
                    with open(filename, 'w') as csvfile:
                        writer = csv.writer(csvfile)
                        writer.writerow(['X', 'Y', 'Z'])
                        writer.writerows(points)
                    print("Saved cross-section for plane '{}' at {} to {}".format(plane, coord_value, filename))
                except Exception as e:
                    print("Error saving CSV for plane '{}' at {}: {}".format(plane, coord_value, e))
            else:
                print("No points extracted for plane '{}' at {}".format(plane, coord_value))

def main():
    # Specify your mesh file; update the path if necessary.
    mesh_file = "baby.obj"
    
    mesh = load_mesh(mesh_file)
    if mesh is None:
        return
    
    # Set the step size to 0.2 (as requested)
    step = 0.2
    output_dir = "cross_sections"
    
    # Extract and save cross-sections
    save_cross_sections(mesh, step, output_dir)

if __name__ == "__main__":
    main()

