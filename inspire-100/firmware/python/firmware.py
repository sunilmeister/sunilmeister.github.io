import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk
import time
import serial.tools.list_ports
import serial
import os 
import ctypes
import shutil
import subprocess
import requests
import zipfile



########## LOGIC  ##############

##### ARDUINO  ###############

# Admin Verification
def is_admin():
    try:
        return os.getuid() == 0
    except AttributeError:
        return ctypes.windll.shell32.IsUserAnAdmin() != 0
    
def install_arduino_cli():

    def is_admin():
        try:
            return os.getuid() == 0
        except AttributeError:
            return ctypes.windll.shell32.IsUserAnAdmin() != 0

    try:
        if not shutil.which("arduino-cli"):

            if os.name == "posix":
                for i in range(7, 15):
                    progress_bar["value"] = i
                    time.sleep(0.1)
                    root.update_idletasks()

                print("Installing Arduino CLI...")
                log_text.insert(tk.END, f"Installing Arduino CLI...\n")

                if shutil.which("brew"):
                    subprocess.run(["brew", "install", "arduino-cli"])
                    log_text.insert(tk.END, f"Arduino CLI is Installed.\n")
                    print("Arduino CLI installed.")
                    # Check if the platform 'arduino:avr' is installed
                    platform_check = subprocess.run(["arduino-cli", "core", "list"], capture_output=True, text=True)
                    if "arduino:avr" not in platform_check.stdout:
                        print("Platform 'arduino:avr' not found. Installing...")
                        log_text.insert(tk.END, f"Platform 'arduino:avr' not found. Installing...\n")
                        install_process = subprocess.run(["arduino-cli", "core", "install", "arduino:avr"], capture_output=True, text=True)
                        if install_process.returncode != 0:
                            print("Failed to install platform 'arduino:avr'.")
                            log_text.insert(tk.END, f"ERROR : Failed to install platform 'arduino:avr'.\n")
                            return False

                    board_check = subprocess.run(["arduino-cli", "board", "list"], capture_output=True, text=True)
                    if "Arduino Mega" not in board_check.stdout:
                        print("No ardiuno Board is conneted. Please connect it first")
                        log_text.insert(tk.END, f"No ardiuno Board is conneted. \n Please connect it first.\n")
                        return False
                    return True
                else:
                    print("Homebrew is required for macOS. Please install it first.")
                    log_text.insert(tk.END, f"Requirement : Homebrew is required for macOS. Please install it first.\n")
                    return False
                
            elif os.name == 'nt':
                if not is_admin():
                    print("Administrator permissions required. Please rerun this script as an administrator.")
                    log_text.insert(tk.END, f"Administrator permissions required. Please rerun this script as an administrator.\n")
                    progress_label.config(text=f"Administrator permissions required.")
                    return False
                
                for i in range(7, 15):
                    progress_bar["value"] = i
                    time.sleep(0.1)
                    root.update_idletasks()
                    
                print("Installing Chocolatey...")
                log_text.insert(tk.END, f"Installing Chocolatey...\n")
                if not shutil.which("choco"):
                    subprocess.run(["powershell", "-Command", "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"])
                    print("Chocolatey installed.")
                    log_text.insert(tk.END, f"Chocolatey installed Successfully\n")
                    time.sleep(5)

                print("Installing Arduino CLI...")
                log_text.insert(tk.END, f"Installing Arduino CLI...\n")
                subprocess.run(["choco", "install", "arduino-cli", "-y"])
                print("Arduino CLI installed.")
                log_text.insert(tk.END, f"Arduino CLI installed.\n")
                time.sleep(5)

                # Check if the platform 'arduino:avr' is installed
                platform_check = subprocess.run(["arduino-cli", "core", "list"], capture_output=True, text=True)
                if "arduino:avr" not in platform_check.stdout:
                    print("Platform 'arduino:avr' not found. Installing...")
                    log_text.insert(tk.END, f"Platform 'arduino:avr' not found. Installing...\n")
                    install_process = subprocess.run(["arduino-cli", "core", "install", "arduino:avr"], capture_output=True, text=True)
                    if install_process.returncode != 0:
                        print("Failed to install platform 'arduino:avr'.")
                        log_text.insert(tk.END, f"ERROR : Failed to install platform 'arduino:avr'.\n")
                        return False
                
                board_check = subprocess.run(["arduino-cli", "board", "list"], capture_output=True, text=True)
                if "Arduino Mega" not in board_check.stdout:
                    print("No ardiuno Board is conneted. Please connect it first")
                    log_text.insert(tk.END, f"No ardiuno Board is conneted. \n Please connect it first.\n")
                    return False

                return True
                
            else:
                print("Unsupported operating system.")
                log_text.insert(tk.END, f"ERROR : Unsupported operating system.\n")
                return False
                
        else:
            for i in range(0, 15):
                progress_bar["value"] = i
                time.sleep(0.1)
                root.update_idletasks()
            print("Arduino CLI already installed.")
            log_text.insert("end", "Arduino CLI already installed.\n")
            return True
    except Exception as e:
        print(f"An error occurred: {e}")
        log_text.insert(tk.END, f"An error occurred: {e}\n")
        return False
    
def find_port(board):
    ports = serial.tools.list_ports.comports()
    name = False 
        
    for port in ports:
        print(port.description)
        if board in port.description:
            if os.name == 'posix':
                name = port.device
            else:
                name = port.name
            return name
            
    if not name:
        progress_label.config(text=f"Progress: Port Not Found")
        return False

def upload_empty_file(sketch_path, board, port):
    try:

        log_text.insert(tk.END, f"Erasing existing code...\n")
        root.update_idletasks() 
        print("Erasing existing code...")
        
        
        compile_process = subprocess.run(["arduino-cli", "compile", "--fqbn", board, sketch_path], capture_output=True, text=True)
        if compile_process.returncode != 0:
            print("Compilation failed:")
            log_text.insert(tk.END, f"Compilation failed: {compile_process.stderr}\n")
            print(compile_process.stderr)
            return False

        if find_port("Arduino Mega 2560") == False:
            print("Port Was removed")
            return False
        
        upload_process = subprocess.run(["arduino-cli", "upload", "-p", port, "--fqbn", board, sketch_path], capture_output=True, text=True)
        if upload_process.returncode != 0:
            print("Upload failed:")
            print(upload_process.stderr)
            log_text.insert(tk.END, f"Upload failed: {upload_process.stderr}\n")
            return False

        print("Erased")
        log_text.insert(tk.END, f"Earsed.\n")
        return True
    
    except Exception as e:
        print("An error occurred:", str(e))
        log_text.insert(tk.END, f"ERROR : An error occurred: {str(e)}\n")
        return False
    
def upload_firmware(hex_file_path, port):
    try:
        print("Updating firmware...")
        log_text.insert(tk.END, f"Updating Firmware......\n")
        root.update_idletasks() 
        upload_process = subprocess.run(["arduino-cli", "upload", "-p", port, "--input-file", hex_file_path], capture_output=True, text=True)
        print(upload_process.stdout)
        log_text.insert(tk.END, f"{upload_process.stdout}\n")

        if upload_process.returncode != 0:
            print("Upload failed:")
            print(upload_process.stderr)
            log_text.insert(tk.END, f"ERROR : An error occurred: {upload_process.stderr}\n")
            return False
        
        if find_port("Arduino Mega 2560") == False:
            print("Port Was removed")
            return False
        
        print("Firmware updated successfully.")
        log_text.insert(tk.END, f"Firmware updated successfully.\n")
        return True
    
    except Exception as e:
        print("An error occurred while updating:", str(e))
        log_text.insert(tk.END, f"ERROR : An error occurred: {str(e)}\n")
        return False
    
def startArduino():
    progress_label.config(text=f"Starting the Installation")
    if install_arduino_cli():
        
        global port
        port = find_port("Arduino Mega 2560")
        if(port):
            log_text.insert(tk.END, f"Port found: {port}\n")
            root.after(1000, upload_empty_file_delayed)
        else:
            print("Port not found Ensure that the laptop's USB port is correctly connected to the INSPIRE-100 system's master USB port.")
            log_text.insert(tk.END, f"Port not found Ensure that the laptop's USB port is correctly connected to the INSPIRE-100 system's master USB port.\n")
    
    else:
        print("A Problem occured while installing the ClI or Choco")
    
def upload_empty_file_delayed():

    for i in range(16,20):
            progress_bar["value"] = i
            time.sleep(0.1)
            root.update_idletasks()
            
    
    # sketch_path = os.getcwd() + "/empty"
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sketch_path = os.path.join(script_dir, "empty")
    board = "arduino:avr:mega"

    erase_check = upload_empty_file(sketch_path, board, port)
    if erase_check:
        progress_label.config(text=f"Progress: Earsed Successfully")
        log_text.insert(tk.END, f"Earsed Successfully\n")
        root.after(1000, upload_Firmware_delayed)

    else:
        progress_label.config(text=f"ERROR: During Earsing")
        log_text.insert(tk.END, f"ERROR: During Earsing\n")

def upload_Firmware_delayed():

    script_dir = os.path.dirname(os.path.abspath(__file__))
    sketch_path = os.path.join(script_dir, "INSPIRE-100_master","INSPIRE-100_master.hex")
    # sketch_path = os.path.join(os.getcwd(), "INSPIRE-100_master","INSPIRE-100_master.hex")
    board = "arduino:avr:mega"

    for i in range(20,30):
            progress_bar["value"] = i
            time.sleep(0.1)
            root.update_idletasks()

    upload = upload_firmware(sketch_path, port)

    if upload:
        progress_label.config(text=f"Progress: Ardiuno Frimware Updated Successfully")
        log_text.insert(tk.END, f"Progress: Ardiuno Frimware Updated Successfully\n")
        for i in range(30,40):
            progress_bar["value"] = i
            time.sleep(0.1)
            root.update_idletasks()
        install_clicked("Slave")
        
    else:
        progress_label.config(text=f"ERROR")
        log_text.insert(tk.END, f"ERROR: Ardiuno Frimware in not updated\n")

##### NODE ###########

def download_and_install_driver(driver_url, extract_path, installer_path):

    if not is_admin():
        print("Administrator permissions required. Please rerun this script as an administrator.")
        log_text.insert(tk.END, f"ERROR: Administrator permissions required. Please rerun this script as an administrator.\n")
        return False
         
    try:
        # Create a directory for driver files
        os.makedirs(extract_path, exist_ok=True)

        # Download the driver file directly into the driver_files directory
        progress_label.config(text=f"Progress: Download the driver file")

        response = requests.get(driver_url)
        if response.status_code == 200:
            # Save the downloaded file
            with open(os.path.join(extract_path, "driver.zip"), 'wb') as f:
                f.write(response.content)
            print("Driver downloaded successfully.")
            log_text.insert(tk.END, f"Driver downloaded successfully.\n")
        
        for i in range(40,45):
            progress_bar["value"] = i
            time.sleep(0.1)
            root.update_idletasks()

            # Extract the contents of the ZIP file
            with zipfile.ZipFile(os.path.join(extract_path, "driver.zip"), 'r') as zip_ref:
                zip_ref.extractall(extract_path)
            print("Driver files extracted to:", extract_path)
            log_text.insert(tk.END, f"Driver files extracted to: {extract_path}\n")

        for i in range(45,50):
            progress_bar["value"] = i
            time.sleep(0.1)
            root.update_idletasks()

            # Executing the Driver Installer
            if installer_path:
                subprocess.run([installer_path])  # You may need to adjust this depending on the installer type

            # Clean up: delete the downloaded ZIP file
            os.remove(os.path.join(extract_path, "driver.zip"))
            print("Cleanup: Downloaded ZIP file deleted.")
            log_text.insert("end", "Cleanup: Downloaded ZIP file deleted.\n")
            log_text.insert(tk.END, f"Cleanup: Downloaded ZIP file deleted.\n")

            # Clean up: delete the entire driver_files directory
            shutil.rmtree(extract_path)
            print("Cleanup: driver_files directory deleted.")
            log_text.insert(tk.END, f"Cleanup: driver_files directory deleted.\n")

            return True

        else:
            print("Failed to download driver. Status code:", response.status_code)
            log_text.insert(tk.END, f"Failed to download driver. Status code: {response.status_code}\n")
            return False

    except Exception as e:
        print("An error occurred:", e)
        log_text.insert(tk.END, f"An error occurred: {e}\n")
        return False


def update_esp8266_index():
    try:
        # Command to update the Arduino CLI index to include the ESP8266 package
        progress_label.config(text=f"Progress: Updating ESP8266 Index")
        command_update_index = [
            "arduino-cli",
            "core",
            "install",
            "esp8266:esp8266",
            "--additional-urls",
            "http://arduino.esp8266.com/stable/package_esp8266com_index.json"
        ]
        
        # Execute the command to update the index
        subprocess.run(command_update_index, check=True)

        print("ESP8266 index updated and architecture installed successfully.")
        log_text.insert(tk.END, f"ESP8266 index updated and architecture installed successfully.\n")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error updating ESP8266 index or installing architecture: {e}")
        log_text.insert(tk.END, f"Error updating ESP8266 index or installing architecture: {e}\n")
        return False

def upload_bin_to_nodemcu(bin_file_path, port):

    for i in range(70,80):
            progress_bar["value"] = i
            time.sleep(0.1)
            root.update_idletasks()

    update_esp8266_index()

    for i in range(80,90):
            progress_bar["value"] = i
            time.sleep(0.1)
            root.update_idletasks()

    command = [
        "arduino-cli",
        "upload",
        "-p",
        port,
        "--fqbn",
        "esp8266:esp8266:nodemcu",
        "--input-file",
        bin_file_path
    ]
    
    try:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        if(os.name == "nt") :
            if find_port("Silicon Labs CP210x USB to UART Bridge") == False:
                print("Port Was removed")
                return False
        
        else :
            if find_port("CP2102 USB to UART Bridge Controller") == False:
                print("Port Was removed")
                return False
        
        for line in process.stdout:
            print(line, end='')  # Print each line of output without newline
            log_text.insert(tk.END, f"{line}")
            root.update_idletasks()

        process.wait()
        print("Upload successful.")
        log_text.insert(tk.END, f"Upload Successfully\n")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error uploading: {e}")
        log_text.insert(tk.END, f"ERROR uploading : {e}\n")
        return False

def startNode():
    progress_label.config(text=f"Starting the Installation Of NodeMCU")
    if(os.name == "nt") :
        driver_url = "https://www.silabs.com/documents/public/software/CP210x_Windows_Drivers.zip"  # Replace with the actual driver URL
        extract_path = "driver_files"
        installer_path = os.getcwd() + "/driver_files/CP210xVCPInstaller_x64.exe"
        driver = download_and_install_driver(driver_url,extract_path,installer_path)
        if(driver):
            root.after(1000, find_port_delayed_node)

    else : root.after(1000, find_port_delayed_node)

def find_port_delayed_node():
    progress_label.config(text=f"Progress: Finding NodeMCU")
    log_text.insert(tk.END, f"Finding NodeMCU\n")

    global port_node

    for i in range(50,60):
            progress_bar["value"] = i
            time.sleep(0.1)
            root.update_idletasks()

    if(os.name == "nt"):
        port_node = find_port("Silicon Labs CP210x USB to UART Bridge")

    else:
        
        port_node = find_port("CP2102 USB to UART Bridge Controller")
    
    if port_node:
        log_text.insert(tk.END, f"Port found: {port_node}\n")
        root.after(1000,upload_firmware_Node_delayed)

    else:
        progress_label.config(text=f"ERROR : Port not found")
        log_text.insert(tk.END, f"Port Not Found. \n")

def upload_firmware_Node_delayed():

    progress_label.config(text=f"Progress: Node Frimware Updated Started")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sketch_path = os.path.join(script_dir, "INSPIRE-100_master","INSPIRE-100_slave.bin")

    for i in range(60,70):
            progress_bar["value"] = i
            time.sleep(0.1)
            root.update_idletasks()

    upload = upload_bin_to_nodemcu(sketch_path, port_node)

    if upload:
        progress_label.config(text=f"Progress: Node Frimware Updated Successfully")
        log_text.insert(tk.END, f"Progress: Node Frimware Updated Successfully\n")
        for i in range(90,100):
            progress_bar["value"] = i
            time.sleep(0.1)
            root.update_idletasks()
    else:
        progress_label.config(text=f"ERROR")
        log_text.insert(tk.END, f"ERROR: Node Frimware in not updated\n")

#################    GUI    #########################

# Function to handle the selection from the dropdown menu
def select_version():
    selected_version = version_var.get()
    if selected_version != "Select Version":
        print("Selected version:", selected_version)
        return select_version
    else:
        print("Please select a version.")
        return False
    
# Installetion Script
def run_installation(board):

    for widget in root.winfo_children():
        widget.destroy()

    time.sleep(1)

    # Load the image
    script_dir = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(script_dir, "logo.png")
    original_image = Image.open(image_path)
    
    # Calculate the new size while maintaining aspect ratio
    desired_width = 400
    aspect_ratio = original_image.width / original_image.height
    desired_height = int(desired_width / aspect_ratio)
    
    # Resize the image
    resized_image = original_image.resize((desired_width, desired_height))
    photo = ImageTk.PhotoImage(resized_image)
    
    # Add the image at the top
    image_label = tk.Label(root, image=photo, bg='#0C3E51')  # Set background color for label
    image_label.image = photo  # Keep a reference to the image to prevent garbage collection
    image_label.pack()

    # Progress Label
    
    global progress_label
    progress_label = tk.Label(root, text="Progress: 0%", bg="#0C3E51", fg="white")
    progress_label.pack(padx=10, pady=10, anchor="w")

    style = ttk.Style()
    style.theme_use('default')
    style.configure("Custom.Horizontal.TProgressbar", background='#11F158')  # Set background color

    
    global progress_bar
    progress_bar = ttk.Progressbar(root, orient='horizontal', length=500, mode='determinate', style="Custom.Horizontal.TProgressbar")
    progress_bar.pack(pady=10, padx=10, ipady=1)

    global log_text
    log_text = tk.Text(master=root, height=8, width=47, bd=1, bg="black", fg="white")
    log_text.pack(pady=10)

    if(board == "Master"):
        startArduino()
    else:
        startNode()
    
def install_clicked(board):

    # Version select
    if (select_version() == False): 
        return print("no version is selected")
    

    # Download the frimware

    # Destroy all widgets
    for widget in root.winfo_children():
        widget.destroy()

    # Load the image
    script_dir = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(script_dir, "logo.png")
    original_image = Image.open(image_path)
    
    # Calculate the new size while maintaining aspect ratio
    desired_width = 400
    aspect_ratio = original_image.width / original_image.height
    desired_height = int(desired_width / aspect_ratio)
    
    # Resize the image
    resized_image = original_image.resize((desired_width, desired_height))
    photo = ImageTk.PhotoImage(resized_image)
    
    # Add the image at the top
    image_label = tk.Label(root, image=photo, bg='#0C3E51')  # Set background color for label
    image_label.image = photo  # Keep a reference to the image to prevent garbage collection
    image_label.pack()
    
    # Create new UI elements
    new_label = tk.Label(root, text="Connect Laptop USB port to the {} USB port of the INSPIRE-100 system".format(board), bg='#0C3E51', fg='white', font=('Arial', 20), wraplength=300)
    new_label.pack(pady=20)

    # Add new button
    new_button = tk.Button(root, text="Next", command=lambda: run_installation(board), bg='#39FF14', fg="white", font=('Helvetica', 12, 'bold'), highlightbackground='#0C3E51')
    new_button.pack(pady=10)

# Create the main window
root = tk.Tk()
root.title("Simple GUI")
root.geometry("400x400")
root.configure(bg='#0C3E51')  # Set background color
root.resizable(False, False) # Prevent window from resizing

# Load the image
script_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the path to logo.png relative to the script's directory
image_path = os.path.join(script_dir, "logo.png")
original_image = Image.open(image_path)

# Calculate the new size while maintaining aspect ratio
desired_width = 400
aspect_ratio = original_image.width / original_image.height
desired_height = int(desired_width / aspect_ratio)

# Resize the image
resized_image = original_image.resize((desired_width, desired_height))
photo = ImageTk.PhotoImage(resized_image)

# Add the image at the top
image_label = tk.Label(root, image=photo, bg='#0C3E51')  # Set background color for label
image_label.pack()

# Add other widgets below the image
label = tk.Label(root, text="Select the version for the app:", bg='#0C3E51', fg='white', font=('Arial', 14))  # Set background color, text color, and font
label.pack(pady=20)

# Dropdown menu for selecting app version
version_var = tk.StringVar(root)
version_var.set("Select Version")  # Default option
versions = ["Version 1", "Version 2", "Version 3"]  # Example versions, you can modify this list
version_dropdown = tk.OptionMenu(root, version_var, *versions)
version_dropdown.config(bg='#0C3E51', fg='white', font=('Arial', 12))  # Set background color, text color, and font
version_dropdown.pack()

# Button to confirm selection
select_button = tk.Button(root, text="Select", command=select_version, bg='white', font=('Arial', 12), highlightbackground='#0C3E51')  # Set background color, text color, and font
select_button.pack(pady=10)

separator = ttk.Separator(root, orient='horizontal')
separator.pack(fill='x', pady=10)

# Create the install button
install_button = tk.Button(root, text="Install", command=lambda:install_clicked("Master"), borderwidth=0, relief='flat', bg='#39FF14',fg="white", font=('Helvetica', 12, 'bold'), highlightbackground='#0C3E51')
install_button.pack(pady=10)

# Start the GUI event loop
root.mainloop()