import os
import shutil
import threading
import subprocess
import time
import tkinter as tk
import tempfile

from src.config.config import (
    installation_complete,
    root,
)
from src.utils.utils import find_port, is_admin
from src.config.color import BACKGROUND_COLOR, TEXT_COLOR, ACCENT_COLOR


def install_arduino_cli(log_text, progress_label, progress_bar):
    # Run the installation in a separate thread
    install_thread = threading.Thread(
        target=install_arduino_cli_thread, args=(log_text, progress_label, progress_bar)
    )
    install_thread.daemon = (
        True  # Make the thread a daemon so it exits when the main program exits
    )
    install_thread.start()

    # Start updating the progress bar to show the application is still responsive
    update_progress_during_install(progress_bar)


def update_progress_during_install(progress_bar):
    # Update progress bar until the installation is complete
    if not installation_complete:
        progress_bar["value"] = (progress_bar["value"] + 0.5) % 15  # Cycle between 0-15
        root.update_idletasks()
        root.after(100, update_progress_during_install, progress_bar)


def install_arduino_cli_thread(log_text, progress_label, progress_bar):
    global installation_complete, installation_success

    installation_complete = False
    installation_success = False

    try:
        if not shutil.which("arduino-cli"):
            if os.name == "posix":
                # Log that installation is starting
                root.after(
                    0, lambda: log_text.insert(tk.END, f"Installing Arduino CLI...\n")
                )
                root.after(0, lambda: root.update_idletasks())

                if shutil.which("brew"):
                    # Use Popen to avoid blocking
                    process = subprocess.Popen(
                        ["brew", "install", "arduino-cli"],
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        creationflags=(
                            subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
                        ),
                    )
                    stdout, stderr = process.communicate()

                    # Log the result
                    root.after(
                        0,
                        lambda: log_text.insert(tk.END, f"Arduino CLI is Installed.\n"),
                    )
                    root.after(0, lambda: root.update_idletasks())

                    # Check if the platform 'arduino:avr' is installed
                    platform_check = subprocess.run(
                        ["arduino-cli", "core", "list"],
                        capture_output=True,
                        text=True,
                        creationflags=(
                            subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
                        ),
                    )
                    if "arduino:avr" not in platform_check.stdout:
                        root.after(
                            0,
                            lambda: log_text.insert(
                                tk.END,
                                f"Platform 'arduino:avr' not found. Installing...\n",
                            ),
                        )
                        root.after(0, lambda: root.update_idletasks())

                        install_process = subprocess.Popen(
                            ["arduino-cli", "core", "install", "arduino:avr"],
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            creationflags=(
                                subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
                            ),
                        )
                        stdout, stderr = install_process.communicate()

                        if install_process.returncode != 0:
                            root.after(
                                0,
                                lambda: log_text.insert(
                                    tk.END,
                                    f"ERROR : Failed to install platform 'arduino:avr'.\n",
                                ),
                            )
                            root.after(0, lambda: root.update_idletasks())
                            installation_complete = True
                            return

                    board_check = subprocess.run(
                        ["arduino-cli", "board", "list"],
                        capture_output=True,
                        text=True,
                        creationflags=(
                            subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
                        ),
                    )
                    if "Arduino Mega" not in board_check.stdout:
                        root.after(
                            0,
                            lambda: log_text.insert(
                                tk.END,
                                f"No Arduino Board is connected. \nPlease connect it first.\n",
                            ),
                        )
                        root.after(0, lambda: root.update_idletasks())
                        installation_complete = True
                        return

                    installation_success = True
                else:
                    root.after(
                        0,
                        lambda: log_text.insert(
                            tk.END,
                            f"Requirement: Homebrew is required for macOS. Please install it first.\n",
                        ),
                    )
                    root.after(0, lambda: root.update_idletasks())

            elif os.name == "nt":
                if not is_admin():
                    root.after(
                        0,
                        lambda: log_text.insert(
                            tk.END,
                            f"Administrator permissions required. Please rerun this script as an administrator.\n",
                        ),
                    )
                    root.after(
                        0,
                        lambda: progress_label.config(
                            text=f"Administrator permissions required."
                        ),
                    )
                    root.after(0, lambda: root.update_idletasks())
                    installation_complete = True
                    return

                root.after(
                    0, lambda: log_text.insert(tk.END, f"Installing Chocolatey...\n")
                )
                root.after(0, lambda: root.update_idletasks())

                if not shutil.which("choco"):
                    process = subprocess.Popen(
                        [
                            "powershell",
                            "-Command",
                            "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))",
                        ],
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        creationflags=(
                            subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
                        ),
                    )
                    stdout, stderr = process.communicate()

                    root.after(
                        0,
                        lambda: log_text.insert(
                            tk.END, f"Chocolatey installed Successfully\n"
                        ),
                    )
                    root.after(0, lambda: root.update_idletasks())

                root.after(
                    0, lambda: log_text.insert(tk.END, f"Installing Arduino CLI...\n")
                )
                root.after(0, lambda: root.update_idletasks())

                process = subprocess.Popen(
                    ["choco", "install", "arduino-cli", "-y"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
                )
                stdout, stderr = process.communicate()

                root.after(
                    0, lambda: log_text.insert(tk.END, f"Arduino CLI installed.\n")
                )
                root.after(0, lambda: root.update_idletasks())

                # Check if the platform 'arduino:avr' is installed
                platform_check = subprocess.run(
                    ["arduino-cli", "core", "list"],
                    capture_output=True,
                    text=True,
                    creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
                )
                if "arduino:avr" not in platform_check.stdout:
                    root.after(
                        0,
                        lambda: log_text.insert(
                            tk.END, f"Platform 'arduino:avr' not found. Installing...\n"
                        ),
                    )
                    root.after(0, lambda: root.update_idletasks())

                    install_process = subprocess.Popen(
                        ["arduino-cli", "core", "install", "arduino:avr"],
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        creationflags=(
                            subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
                        ),
                    )
                    stdout, stderr = install_process.communicate()

                    if install_process.returncode != 0:
                        root.after(
                            0,
                            lambda: log_text.insert(
                                tk.END,
                                f"ERROR : Failed to install platform 'arduino:avr'.\n",
                            ),
                        )
                        root.after(0, lambda: root.update_idletasks())
                        installation_complete = True
                        return

                board_check = subprocess.run(
                    ["arduino-cli", "board", "list"],
                    capture_output=True,
                    text=True,
                    creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
                )
                print(board_check.stdout)
                if "Arduino Mega" not in board_check.stdout:
                    root.after(
                        0,
                        lambda: log_text.insert(
                            tk.END,
                            f"No Arduino Board is connected. \nPlease connect it first.\n",
                        ),
                    )
                    root.after(0, lambda: root.update_idletasks())
                    installation_complete = True
                    return

                installation_success = True

            else:
                root.after(
                    0,
                    lambda: log_text.insert(
                        tk.END, f"ERROR : Unsupported operating system.\n"
                    ),
                )
                root.after(0, lambda: root.update_idletasks())
                installation_complete = True
                return

        else:
            root.after(
                0, lambda: log_text.insert(tk.END, "Arduino CLI already installed.\n")
            )
            root.after(0, lambda: root.update_idletasks())
            installation_success = True
    except Exception as e:
        root.after(0, lambda: log_text.insert(tk.END, f"An error occurred: {e}\n"))
        root.after(0, lambda: root.update_idletasks())

    installation_complete = True

    # If installation was successful, proceed to the next step
    if installation_success:
        root.after(0, lambda: progress_bar.config(value=15))
        root.after(
            0,
            lambda: find_arduino_port(
                log_text=log_text,
                progress_label=progress_label,
                progress_bar=progress_bar,
            ),
        )


def find_arduino_port(log_text, progress_label, progress_bar):
    # Run port detection in a separate thread to avoid blocking UI
    detection_thread = threading.Thread(
        target=find_arduino_port_thread, args=(log_text, progress_label, progress_bar)
    )
    detection_thread.daemon = True
    detection_thread.start()

    # Update UI to show we're detecting the port
    root.after(0, lambda: progress_label.config(text="Detecting Arduino port..."))


def find_arduino_port_thread(log_text, progress_label, progress_bar):
    global port

    # port = find_port("Arduino Mega 2560")
    port = find_port()
    if port:
        root.after(0, lambda: log_text.insert(tk.END, f"Port found: {port}\n"))
        root.after(0, lambda: root.update_idletasks())
        root.after(
            1000,
            upload_empty_file_delayed,
            progress_bar,
            progress_label,
            log_text,
            port,
        )
    else:
        root.after(
            0,
            lambda: log_text.insert(
                tk.END,
                f"Port not found. Ensure that the laptop's USB port is correctly connected to the INSPIRE-100 system's master USB port.\n",
            ),
        )
        root.after(0, lambda: root.update_idletasks())


def upload_empty_file_delayed(progress_bar, progress_label, log_text, port):
    # Start a thread for this operation
    global upload_complete

    upload_thread = threading.Thread(
        target=upload_empty_file_thread,
        args=(progress_bar, progress_label, log_text, port),
    )
    upload_thread.daemon = True
    upload_thread.start()

    # Update progress while waiting
    def update_progress():
        if not upload_complete:
            progress_bar["value"] = 16 + ((progress_bar["value"] - 16 + 0.5) % 4)
            root.update_idletasks()
            root.after(100, update_progress)

    upload_complete = False
    update_progress()


def upload_empty_file_thread(progress_bar, progress_label, log_text, port):
    global upload_complete, upload_success

    # Define empty.ino content
    empty_ino_content = """\
void setup() {
}

void loop() {
}
"""

    # Create a temporary directory for the Arduino sketch
    temp_dir = tempfile.mkdtemp()
    sketch_path = os.path.join(temp_dir, "empty")
    os.makedirs(sketch_path, exist_ok=True)

    # Write the empty.ino file
    ino_file_path = os.path.join(sketch_path, "empty.ino")
    with open(ino_file_path, "w") as ino_file:
        ino_file.write(empty_ino_content)

    board = "arduino:avr:mega"  # Change to your board type

    # Compile the sketch
    compile_process = subprocess.Popen(
        ["arduino-cli", "compile", "--fqbn", board, sketch_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
    )
    stdout, stderr = compile_process.communicate()

    if compile_process.returncode != 0:
        root.after(0, lambda: progress_label.config(text="ERROR: Compilation Failed"))
        root.after(
            0,
            lambda: log_text.insert(tk.END, f"Compilation Error:\n{stderr.decode()}\n"),
        )
        root.after(0, lambda: root.update_idletasks())
        return

    # Upload the compiled binary
    upload_process = subprocess.Popen(
        ["arduino-cli", "upload", "-p", port, "--fqbn", board, sketch_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
    )
    stdout, stderr = upload_process.communicate()

    upload_complete = True
    upload_success = upload_process.returncode == 0

    if upload_success:
        root.after(0, lambda: progress_bar.config(value=20))
        root.after(
            0, lambda: progress_label.config(text="Progress: Erased Successfully")
        )
        root.after(0, lambda: log_text.insert(tk.END, "Erased Successfully\n"))
        root.after(0, lambda: root.update_idletasks())
        root.after(
            1000,
            lambda: upload_Firmware_delayed(progress_bar, progress_label, log_text),
        )
    else:
        root.after(0, lambda: progress_label.config(text="ERROR: During Erasing"))
        root.after(
            0, lambda: log_text.insert(tk.END, f"Upload Error:\n{stderr.decode()}\n")
        )
        root.after(0, lambda: root.update_idletasks())


def upload_Firmware_delayed(progress_bar, progress_label, log_text, user_role="user"):
    # Use the firmware file that was downloaded for the selected version
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sketch_path = os.path.join(
        script_dir, "bin", "INSPIRE-100_master", "INSPIRE-100_master.hex"
    )

    # Check if the firmware file exists
    if not os.path.exists(sketch_path):
        progress_label.config(text=f"ERROR: Firmware file not found")
        log_text.insert(tk.END, f"ERROR: Firmware file not found at {sketch_path}\n")
        return

    board = "arduino:avr:mega"

    # Update progress in small increments
    def update_progress():
        for i in range(20, 30):
            progress_bar["value"] = i
            root.update_idletasks()
            time.sleep(0.05)

    # Run progress update in a separate thread to keep UI responsive
    progress_thread = threading.Thread(target=update_progress)
    progress_thread.daemon = True
    progress_thread.start()

    # Log that we're using the downloaded firmware file
    log_text.insert(tk.END, f"Using firmware file: {sketch_path}\n")
    root.update_idletasks()

    # Start the firmware upload process
    upload_firmware(
        sketch_path, port, log_text, board, progress_bar, progress_label, user_role
    )


def upload_firmware(
    hex_file_path, port, log_text, board, progress_bar, progress_label, user_role="user"
):
    # Start a thread for this operation
    upload_thread = threading.Thread(
        target=upload_firmware_thread,
        args=(
            hex_file_path,
            port,
            log_text,
            board,
            progress_bar,
            progress_label,
            user_role,
        ),
    )
    upload_thread.daemon = True
    upload_thread.start()

    # Return True to continue the flow, actual success will be handled in the thread
    return True


def upload_firmware_thread(
    hex_file_path, port, log_text, board, progress_bar, progress_label, user_role="user"
):
    global firmware_upload_success
    firmware_upload_success = False

    try:
        root.after(
            0,
            lambda: log_text.insert(
                tk.END,
                f"Updating Firmware using file: {os.path.basename(hex_file_path)}...\n",
            ),
        )
        root.after(0, lambda: root.update_idletasks())

        # Use Popen instead of run to avoid blocking
        upload_process = subprocess.Popen(
            [
                "arduino-cli",
                "upload",
                "-b",
                board,
                "-p",
                port,
                "--input-file",
                hex_file_path,
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
        )
        stdout, stderr = upload_process.communicate()

        # Process results in the main thread
        root.after(0, lambda: log_text.insert(tk.END, f"{stdout}\n"))

        if upload_process.returncode != 0:
            root.after(
                0,
                lambda: log_text.insert(
                    tk.END, f"ERROR : An error occurred: {stderr}\n"
                ),
            )
            firmware_upload_success = False
            return

        # Check port after upload
        port_check = find_port()
        if not port_check:
            root.after(0, lambda: log_text.insert(tk.END, "Port was removed\n"))
            firmware_upload_success = False
            return

        root.after(
            0, lambda: log_text.insert(tk.END, f"Firmware updated successfully.\n")
        )
        firmware_upload_success = True

        # Update UI to show completion
        root.after(
            0,
            lambda: on_firmware_upload_complete(
                True,
                progress_bar=progress_bar,
                progress_label=progress_label,
                log_text=log_text,
                user_role=user_role,
            ),
        )

    except Exception as e:
        root.after(
            0, lambda: log_text.insert(tk.END, f"ERROR : An error occurred: {str(e)}\n")
        )
        firmware_upload_success = False

        # Update UI to show error
        root.after(
            0,
            lambda: on_firmware_upload_complete(
                True,
                progress_bar=progress_bar,
                progress_label=progress_label,
                log_text=log_text,
                user_role=user_role,
            ),
        )


def on_firmware_upload_complete(
    success, progress_label, log_text, progress_bar, user_role="user"
):
    from src.ui.run_installation import show_connection_instructions

    if success:
        progress_label.config(text=f"Progress: Arduino Firmware Updated Successfully")
        log_text.insert(tk.END, f"Progress: Arduino Firmware Updated Successfully\n")
        for i in range(30, 40):
            progress_bar["value"] = i
            time.sleep(0.01)  # Reduced sleep time for better responsiveness
            root.update_idletasks()
        show_connection_instructions(board="Slave", user_role=user_role)
    else:
        error_message = "Firmware installation failed! Make sure no other program (Arduino IDE, serial monitor, etc.) is using the port. Try unplugging and replugging the device."
        show_retry_installation_ui(
            board="Master",
            user_role=user_role,
            error_message=error_message,
            retry_callback=lambda: startArduino(
                progress_bar, progress_label, log_text, user_role
            ),
        )


def show_retry_installation_ui(board, user_role, error_message, retry_callback):
    for widget in root.winfo_children():
        widget.destroy()
    main_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
    main_frame.pack(fill="both", expand=True, padx=20, pady=20)
    error_label = tk.Label(
        main_frame,
        text=error_message,
        bg=BACKGROUND_COLOR,
        fg="red",
        font=("Helvetica", 14, "bold"),
        wraplength=400,
        justify="center",
    )
    error_label.pack(pady=(0, 20))
    try_again_button = tk.Button(
        main_frame,
        text="Try Again",
        command=retry_callback,
        bg=ACCENT_COLOR,
        fg="white",
        font=("Helvetica", 12, "bold"),
        relief=tk.FLAT,
        padx=30,
        pady=8,
        cursor="hand2",
    )
    try_again_button.pack(pady=10)


def startArduino(progress_bar, progress_label, log_text, user_role="user"):
    global installation_complete
    installation_complete = False
    progress_label.config(text=f"Starting the Installation")
    install_arduino_cli(
        log_text=log_text, progress_label=progress_label, progress_bar=progress_bar
    )
