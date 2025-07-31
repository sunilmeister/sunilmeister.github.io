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
from tkinter import ttk
import subprocess
import threading
import time
import serial


def perform_erase(board_type, erase_type, user_role="admin"):
    """
    Perform the actual erase operation using threading to prevent UI blocking.

    Args:
        board_type (str): Type of board ('Arduino Mega 2560' or 'NodeMCU').
        erase_type (str): Type of erase ('ROM' or 'EPROM').
        user_role (str): Role of the logged-in user (default is 'admin').
    """
    # Check for connected port before starting the erase process
    port = find_port()
    if not port:
        show_error(
            "No compatible device found. Please connect the device and try again."
        )
        return

    # Clear existing widgets and show progress screen
    for widget in root.winfo_children():
        widget.destroy()

    # Create main progress frame
    progress_main_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
    progress_main_frame.pack(fill="both", expand=True, padx=20, pady=20)

    # Title
    title_label = tk.Label(
        progress_main_frame,
        text=f"Erasing {erase_type} - {board_type}",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 16, "bold"),
    )
    title_label.pack(pady=(50, 30))

    # Progress status label
    progress_label = tk.Label(
        progress_main_frame,
        text="Initializing erase operation...",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 12),
    )
    progress_label.pack(pady=(0, 20))

    # Progress bar using ttk for better appearance
    progress_bar = ttk.Progressbar(
        progress_main_frame,
        orient="horizontal",
        length=400,
        mode="determinate",
        maximum=100,
    )
    progress_bar.pack(pady=(0, 20))
    progress_bar["value"] = 0

    # Percentage label
    percentage_label = tk.Label(
        progress_main_frame,
        text="0%",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 11),
    )
    percentage_label.pack(pady=(0, 30))

    # Warning message during operation
    warning_label = tk.Label(
        progress_main_frame,
        text="⚠️ Do not disconnect the device during this operation",
        bg=BACKGROUND_COLOR,
        fg="orange",
        font=("Helvetica", 10, "italic"),
    )
    warning_label.pack(pady=(0, 20))

    thread = threading.Thread(
        target=erase_thread,
        args=(
            board_type,
            erase_type,
            progress_bar,
            progress_label,
            percentage_label,
            user_role,
        ),
    )
    thread.daemon = True
    thread.start()


def erase_thread(
    board_type,
    erase_type,
    progress_bar,
    progress_label,
    percentage_label,
    user_role="admin",
):
    """
    Thread function for performing the erase operation.

    Args:
        board_type (str): Type of board ('Arduino Mega 2560' or 'NodeMCU').
        erase_type (str): Type of erase ('ROM' or 'EPROM').
        progress_bar (ttk.Progressbar): Progress bar widget.
        progress_label (tk.Label): Label widget for progress status.
        percentage_label (tk.Label): Label widget for percentage display.
        user_role (str): Role of the logged-in user (default is 'admin').
    """
    try:
        # Double-check port availability in thread
        port = find_port()
        if not port:
            root.after(
                0, show_error, "Device disconnected. Please reconnect and try again."
            )
            return

        # Update progress with detailed steps
        steps = [
            ("Preparing erase operation...", 10),
            ("Checking device connection...", 20),
            ("Creating temporary files...", 30),
            ("Compiling empty sketch...", 50),
            ("Uploading to device...", 80),
            ("Finalizing erase...", 95),
            ("Erase complete!", 100),
        ]

        for i, (step_text, progress_value) in enumerate(steps):
            # Update progress bar and labels
            root.after(
                0,
                lambda p=progress_value, t=step_text, pct=progress_value: [
                    progress_bar.configure(value=p),
                    progress_label.configure(text=t),
                    percentage_label.configure(text=f"{pct}%"),
                ],
            )

            # Perform actual erase operation during the upload step
            if i == 4:  # Upload step
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

            # Wait between steps (except for the last step)
            if i < len(steps) - 1:
                time.sleep(1.5)

        # Show completion page after a brief delay
        time.sleep(1)
        root.after(0, show_erase_confirmation_page, board_type, erase_type, user_role)
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

        # First compile the sketch with timeout
        compile_cmd = ["arduino-cli", "compile", "--fqbn", board, ino_file_path]
        compile_result = subprocess.run(
            compile_cmd, capture_output=True, text=True, timeout=30
        )

        if compile_result.returncode != 0:
            print(f"Error compiling Arduino Mega sketch: {compile_result.stderr}")
            return False

        # Then upload the compiled sketch with timeout
        upload_cmd = [
            "arduino-cli",
            "upload",
            "-p",
            port,
            "--fqbn",
            board,
            ino_file_path,
        ]
        upload_result = subprocess.run(
            upload_cmd, capture_output=True, text=True, timeout=60
        )

        success = upload_result.returncode == 0
        if not success:
            print(f"Error uploading to Arduino Mega: {upload_result.stderr}")
        return success
    except subprocess.TimeoutExpired:
        print("Arduino CLI operation timed out. Please check device connection.")
        return False
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

        # First compile the sketch with timeout
        compile_cmd = ["arduino-cli", "compile", "--fqbn", board, ino_file_path]
        compile_result = subprocess.run(
            compile_cmd, capture_output=True, text=True, timeout=30
        )

        if compile_result.returncode != 0:
            print(f"Error compiling NodeMCU sketch: {compile_result.stderr}")
            return False

        # Then upload the compiled sketch with timeout
        upload_cmd = [
            "arduino-cli",
            "upload",
            "-p",
            port,
            "--fqbn",
            board,
            ino_file_path,
        ]
        upload_result = subprocess.run(
            upload_cmd, capture_output=True, text=True, timeout=60
        )

        success = upload_result.returncode == 0
        if not success:
            print(f"Error uploading to NodeMCU: {upload_result.stderr}")
        return success
    except subprocess.TimeoutExpired:
        print("Arduino CLI operation timed out. Please check device connection.")
        return False
    except Exception as e:
        print(f"Error erasing NodeMCU ROM: {str(e)}")
        return False
