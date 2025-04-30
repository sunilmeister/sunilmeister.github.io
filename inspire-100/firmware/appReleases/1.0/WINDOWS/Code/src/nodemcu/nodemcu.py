import os
import shutil
import threading
import time
from urllib import request
import zipfile
import tkinter as tk
import subprocess

from src.config.config import root
from src.utils.utils import is_admin, find_port


def download_and_install_driver(
    driver_url, extract_path, installer_path, progress_bar, progress_label, log_text
):
    # Start a thread for this operation
    download_thread = threading.Thread(
        target=download_and_install_driver_thread,
        args=(
            driver_url,
            extract_path,
            installer_path,
            progress_bar,
            progress_label,
            log_text,
        ),
    )
    download_thread.daemon = True
    download_thread.start()


def download_and_install_driver_thread(
    driver_url, extract_path, installer_path, progress_bar, progress_label, log_text
):
    if not is_admin():
        root.after(
            0,
            lambda: log_text.insert(
                tk.END,
                "ERROR: Administrator permissions required. Please rerun this script as an administrator.\n",
            ),
        )
        return False

    try:
        # Create a directory for driver files
        os.makedirs(extract_path, exist_ok=True)

        # Download the driver file directly into the driver_files directory
        root.after(
            0, lambda: progress_label.config(text=f"Progress: Download the driver file")
        )

        response = request.urlopen(driver_url)
        with open(os.path.join(extract_path, "driver.zip"), "wb") as f:
            f.write(response.read())

        root.after(
            0, lambda: log_text.insert(tk.END, "Driver downloaded successfully.\n")
        )

        # Update progress bar in the main thread
        for i in range(40, 45):
            root.after(0, lambda i=i: progress_bar.configure(value=i))
            root.after(0, lambda: root.update_idletasks())
            time.sleep(0.1)

        with zipfile.ZipFile(os.path.join(extract_path, "driver.zip"), "r") as zip_ref:
            zip_ref.extractall(extract_path)

        root.after(
            0,
            lambda: log_text.insert(
                tk.END, f"Driver files extracted to: {extract_path}\n"
            ),
        )

        # Update progress bar in the main thread
        for i in range(45, 50):
            root.after(0, lambda i=i: progress_bar.configure(value=i))
            root.after(0, lambda: root.update_idletasks())
            time.sleep(0.1)

        if installer_path:
            # Run installer as a subprocess to avoid blocking
            installer_process = subprocess.Popen(
                [installer_path], creationflags=subprocess.CREATE_NO_WINDOW
            )
            installer_process.wait()  # Still wait for installer to complete

        os.remove(os.path.join(extract_path, "driver.zip"))
        shutil.rmtree(extract_path)

        root.after(
            0,
            lambda: log_text.insert(
                tk.END, "Cleanup: driver_files directory deleted.\n"
            ),
        )

        # Continue with port detection after successful driver installation
        root.after(
            0, lambda: find_port_delayed_node(progress_bar, progress_label, log_text)
        )

        return True
    except Exception as e:
        root.after(0, lambda: log_text.insert(tk.END, f"An error occurred: {e}\n"))
        return False


def update_esp8266_index(progress_label, log_text):
    # Start a thread for this operation
    update_thread = threading.Thread(
        target=update_esp8266_index_thread, args=(progress_label, log_text)
    )
    update_thread.daemon = True
    update_thread.start()

    # Return immediately to keep UI responsive
    return True


def update_esp8266_index_thread(progress_label, log_text):
    try:
        # Command to update the Arduino CLI index to include the ESP8266 package
        root.after(
            0, lambda: progress_label.config(text=f"Progress: Updating ESP8266 Index")
        )
        command_update_index = [
            "arduino-cli",
            "core",
            "install",
            "esp8266:esp8266",
            "--additional-urls",
            "http://arduino.esp8266.com/stable/package_esp8266com_index.json",
        ]

        # Execute the command in a non-blocking way
        process = subprocess.Popen(
            command_update_index,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )
        stdout, stderr = process.communicate()

        if process.returncode == 0:
            root.after(
                0,
                lambda: log_text.insert(
                    tk.END,
                    "ESP8266 index updated and architecture installed successfully.\n",
                ),
            )
            return True
        else:
            root.after(
                0,
                lambda: log_text.insert(
                    tk.END, f"Error updating ESP8266 index: {stderr}\n"
                ),
            )
            return False
    except Exception as e:
        root.after(
            0,
            lambda: log_text.insert(
                tk.END, f"Error updating ESP8266 index: {str(e)}\n"
            ),
        )
        return False


def upload_bin_to_nodemcu(bin_file_path, port, progress_bar, progress_label, log_text):
    # Start a thread for this operation
    upload_thread = threading.Thread(
        target=upload_bin_to_nodemcu_thread,
        args=(bin_file_path, port, progress_bar, progress_label, log_text),
    )
    upload_thread.daemon = True
    upload_thread.start()

    # Return True to keep the UI flow going, actual success will be handled in the thread
    return True


def upload_bin_to_nodemcu_thread(
    bin_file_path, port, progress_bar, progress_label, log_text
):
    # Update progress in main thread
    for i in range(70, 80):
        root.after(0, lambda i=i: progress_bar.configure(value=i))
        root.after(0, lambda: root.update_idletasks())
        time.sleep(0.05)  # Reduced sleep time for better responsiveness

    # Update ESP8266 index first (will run in its own thread)
    update_esp8266_index(progress_label, log_text)

    # Give some time for index update to start
    time.sleep(1)

    # Update progress in main thread
    for i in range(80, 90):
        root.after(0, lambda i=i: progress_bar.configure(value=i))
        root.after(0, lambda: root.update_idletasks())
        time.sleep(0.05)

    command = [
        "arduino-cli",
        "upload",
        "-p",
        port,
        "--fqbn",
        "esp8266:esp8266:nodemcu",
        "--input-file",
        bin_file_path,
    ]

    try:
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )

        # Stream output to log without blocking UI
        def stream_output():
            for line in iter(process.stdout.readline, ""):
                if not line:
                    break
                root.after(0, lambda line=line: log_text.insert(tk.END, line))
                root.after(0, lambda: root.update_idletasks())

        output_thread = threading.Thread(target=stream_output)
        output_thread.daemon = True
        output_thread.start()

        # Wait for process to complete in this thread (not in UI thread)
        process.wait()

        # Check if port is still available
        port_check = False
        if os.name == "nt":
            port_check = find_port()
        else:
            port_check = find_port()

        if not port_check:
            root.after(0, lambda: log_text.insert(tk.END, "Port was removed\n"))
            root.after(
                0,
                lambda: on_upload_complete(
                    False, progress_bar, progress_label, log_text
                ),
            )
            return False

        # Handle success/failure
        if process.returncode == 0:
            root.after(0, lambda: log_text.insert(tk.END, f"Upload Successfully\n"))
            root.after(
                0,
                lambda: on_upload_complete(
                    True, progress_bar, progress_label, log_text
                ),
            )
            return True
        else:
            root.after(
                0,
                lambda: log_text.insert(
                    tk.END, f"Error uploading: Return code {process.returncode}\n"
                ),
            )
            root.after(
                0,
                lambda: on_upload_complete(
                    False, progress_bar, progress_label, log_text
                ),
            )
            return False

    except Exception as e:
        root.after(0, lambda: log_text.insert(tk.END, f"ERROR uploading : {str(e)}\n"))
        root.after(
            0, lambda: on_upload_complete(False, progress_bar, progress_label, log_text)
        )
        return False


def on_upload_complete(success, progress_bar, progress_label, log_text):
    from src.ui.ui import show_connect_master_screen

    if success:
        progress_label.config(text="Progress: Node Firmware Updated Successfully")
        log_text.insert(tk.END, "Progress: Node Firmware Updated Successfully\n")

        # Update progress bar in a non-blocking way
        def update_final_progress():
            for i in range(90, 101):
                progress_bar["value"] = i
                root.update_idletasks()
                time.sleep(0.02)  # Very short delay for smooth animation
            show_connect_master_screen()

        final_progress_thread = threading.Thread(target=update_final_progress)
        final_progress_thread.daemon = True
        final_progress_thread.start()
    else:
        progress_label.config(text="ERROR")
        log_text.insert(tk.END, "ERROR: Node Firmware not updated\n")


def find_port_delayed_node(progress_bar, progress_label, log_text):
    # Start port detection in a separate thread
    detection_thread = threading.Thread(
        target=find_port_delayed_node_thread,
        args=(progress_bar, progress_label, log_text),
    )
    detection_thread.daemon = True
    detection_thread.start()

    # Update UI immediately to show we're searching
    root.after(0, lambda: progress_label.config(text="Progress: Finding NodeMCU"))
    root.after(0, lambda: log_text.insert(tk.END, "Finding NodeMCU\n"))


def find_port_delayed_node_thread(progress_bar, progress_label, log_text):
    global port_node

    # Update progress in the main thread
    for i in range(50, 60):
        root.after(0, lambda i=i: progress_bar.configure(value=i))
        root.after(0, lambda: root.update_idletasks())
        time.sleep(0.05)

    port_node = find_port()

    if port_node:
        root.after(0, lambda: log_text.insert(tk.END, f"Port found: {port_node}\n"))
        root.after(
            100,  # Reduced delay for better responsiveness
            lambda: upload_firmware_Node_delayed(
                port_node, progress_bar, progress_label, log_text
            ),
        )
    else:
        root.after(0, lambda: progress_label.config(text="ERROR: Port not found"))
        root.after(0, lambda: log_text.insert(tk.END, "Port Not Found. \n"))


def upload_firmware_Node_delayed(port_node, progress_bar, progress_label, log_text):
    root.after(
        0, lambda: progress_label.config(text="Progress: Node Firmware Update Started")
    )

    script_dir = os.path.dirname(os.path.abspath(__file__))
    sketch_path = os.path.join(
        script_dir, "bin", "INSPIRE-100_slave", "INSPIRE-100_slave.bin"
    )

    # Update progress in a non-blocking way
    def update_progress():
        for i in range(60, 70):
            progress_bar["value"] = i
            root.update_idletasks()
            time.sleep(0.05)

    progress_thread = threading.Thread(target=update_progress)
    progress_thread.daemon = True
    progress_thread.start()

    # Start the upload process
    upload_bin_to_nodemcu(
        sketch_path, port_node, progress_bar, progress_label, log_text
    )
    # The rest is handled by on_upload_complete which is called from the upload thread


def startNode(progress_bar, progress_label, log_text):
    root.after(
        0, lambda: progress_label.config(text="Starting the Installation Of NodeMCU")
    )

    if os.name == "nt":
        driver_url = "https://www.silabs.com/documents/public/software/CP210x_Windows_Drivers.zip"
        extract_path = "driver_files"
        installer_path = os.path.join(
            os.getcwd(), "driver_files", "CP210xVCPInstaller_x64.exe"
        )
        download_and_install_driver(
            driver_url,
            extract_path,
            installer_path,
            progress_bar,
            progress_label,
            log_text,
        )
        # Further operations are handled by callbacks in the thread
    else:
        # On non-Windows, proceed directly to port detection
        find_port_delayed_node(progress_bar, progress_label, log_text)
