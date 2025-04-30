import os
import tempfile
from src.config.config import root
from src.config.color import BACKGROUND_COLOR, TEXT_COLOR
from src.utils.utils import find_port
from src.ui.erasing_pages import (
    update_progress,
    show_error,
    show_erase_confirmation_page,
)

import tkinter as tk
import subprocess
import threading
import time
import serial


def perform_erase(board_type, erase_type):
    """
    Perform the actual erase operation using threading to prevent UI blocking.

    Args:
        board_type (str): Type of board ('Arduino Mega 2560' or 'NodeMCU').
        erase_type (str): Type of erase ('ROM' or 'EPROM').
    """
    progress_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
    progress_frame.place(relx=0.5, rely=0.5, anchor="center", width=300, height=150)

    progress_label = tk.Label(
        progress_frame,
        text=f"Erasing {erase_type}...",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 12, "bold"),
    )
    progress_label.pack(pady=10)

    progress_bar = tk.Canvas(
        progress_frame,
        width=200,
        height=20,
        bg=BACKGROUND_COLOR,
        highlightthickness=1,
        highlightbackground=TEXT_COLOR,
    )
    progress_bar.pack(pady=10)

    thread = threading.Thread(
        target=erase_thread, args=(board_type, erase_type, progress_bar, progress_label)
    )
    thread.daemon = True
    thread.start()


def erase_thread(board_type, erase_type, progress_bar, progress_label):
    """
    Thread function for performing the erase operation.

    Args:
        board_type (str): Type of board ('Arduino Mega 2560' or 'NodeMCU').
        erase_type (str): Type of erase ('ROM' or 'EPROM').
        progress_bar (tk.Canvas): Canvas widget for progress bar.
        progress_label (tk.Label): Label widget for progress status.
    """
    try:
        for i in range(10):
            width = (i + 1) * 20
            root.after(
                0,
                update_progress,
                progress_bar,
                width,
                progress_label,
                f"Erasing {erase_type}... {(i+1)*10}%",
            )
            time.sleep(0.3)

            if i == 5:
                if board_type == "Arduino Mega":
                    result = erase_arduino_mega_rom()
                elif board_type == "NodeMCU":
                    result = erase_nodemcu_rom()
                else:
                    root.after(0, show_error, f"Unsupported board type: {board_type}")
                    return

                if not result:
                    root.after(
                        0, show_error, f"Error erasing {erase_type} on {board_type}"
                    )
                    return

        root.after(0, show_erase_confirmation_page, board_type, erase_type)
    except Exception as e:
        root.after(0, show_error, f"Error erasing {erase_type}: {str(e)}")


def erase_arduino_mega_rom():
    """
    Erase the flash memory (ROM) of an Arduino Mega 2560.

    Returns:
        bool: True if erase was successful, False otherwise.
    """
    try:
        port = find_port()
        print(port)
        if not port:
            print("Master Port not found. Please connect the device.")
            return False

        # Define empty.ino content
        empty_ino_content = """\
        void setup() {
        }

        void loop() {
        }
        """

        # Create a temporary directory for the Arduino sketch
        temp_dir = tempfile.mkdtemp()
        sketch_name = "empty"
        sketch_path = os.path.join(temp_dir, sketch_name)
        os.makedirs(sketch_path, exist_ok=True)

        # Write the empty.ino file
        ino_file_path = os.path.join(sketch_path, f"{sketch_name}.ino")
        with open(ino_file_path, "w") as ino_file:
            ino_file.write(empty_ino_content)

        board = "arduino:avr:mega"  # Change to your board type

        # First compile the sketch
        compile_cmd = ["arduino-cli", "compile", "--fqbn", board, ino_file_path]
        compile_result = subprocess.run(compile_cmd, capture_output=True, text=True)

        if compile_result.returncode != 0:
            print(f"Error compiling Arduino Mega sketch: {compile_result.stderr}")
            return False

        # Then upload the compiled sketch
        upload_cmd = [
            "arduino-cli",
            "upload",
            "-p",
            port,
            "--fqbn",
            board,
            ino_file_path,
        ]
        upload_result = subprocess.run(upload_cmd, capture_output=True, text=True)

        success = upload_result.returncode == 0
        if not success:
            print(f"Error uploading to Arduino Mega: {upload_result.stderr}")
        return success
    except Exception as e:
        print(f"Error erasing Arduino Mega ROM: {str(e)}")
        return False


def erase_nodemcu_rom():
    """
    Erase the flash memory (ROM) of a NodeMCU board by uploading an empty sketch.

    Returns:
        bool: True if erase was successful, False otherwise.
    """
    try:
        port = find_port()
        if not port:
            print("Slave not found. Please connect the device.")
            return False

        # Define empty.ino content
        empty_ino_content = """\
        void setup() {
        }

        void loop() {
        }
        """

        # Create a temporary directory for the Arduino sketch
        temp_dir = tempfile.mkdtemp()
        sketch_name = "empty"
        sketch_path = os.path.join(temp_dir, sketch_name)
        os.makedirs(sketch_path, exist_ok=True)

        # Write the empty.ino file
        ino_file_path = os.path.join(sketch_path, f"{sketch_name}.ino")
        with open(ino_file_path, "w") as ino_file:
            ino_file.write(empty_ino_content)

        # Board FQBN for NodeMCU (ESP8266)
        board = "esp8266:esp8266:nodemcuv2"

        # First compile the sketch
        compile_cmd = ["arduino-cli", "compile", "--fqbn", board, ino_file_path]
        compile_result = subprocess.run(compile_cmd, capture_output=True, text=True)

        if compile_result.returncode != 0:
            print(f"Error compiling NodeMCU sketch: {compile_result.stderr}")
            return False

        # Then upload the compiled sketch
        upload_cmd = [
            "arduino-cli",
            "upload",
            "-p",
            port,
            "--fqbn",
            board,
            ino_file_path,
        ]
        upload_result = subprocess.run(upload_cmd, capture_output=True, text=True)

        success = upload_result.returncode == 0
        if not success:
            print(f"Error uploading to NodeMCU: {upload_result.stderr}")
        return success
    except Exception as e:
        print(f"Error erasing NodeMCU ROM: {str(e)}")
        return False
