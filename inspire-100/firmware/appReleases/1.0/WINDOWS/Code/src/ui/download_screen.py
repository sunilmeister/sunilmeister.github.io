from src.config.config import root
from src.config.color import BACKGROUND_COLOR, TEXT_COLOR, ACCENT_COLOR
from src.ui.utils import load_and_resize_image
from src.ui.run_installation import show_connection_instructions

import tkinter as tk
from tkinter import ttk
import os
import urllib.request
import urllib.error


def download_screen(board, version):
    """
    Display a download screen with progress indicators for firmware files.

    Args:
        board (str): The board type (Master or Slave)
        version (str): The selected firmware version
    """
    # Destroy all widgets
    for widget in root.winfo_children():
        widget.destroy()

    # Load the image
    photo = load_and_resize_image()

    # Create main frame for better organization
    main_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
    main_frame.pack(fill="both", expand=True, padx=20, pady=20)

    # Add the image at the top
    image_label = tk.Label(main_frame, image=photo, bg=BACKGROUND_COLOR)
    image_label.image = photo
    image_label.pack(pady=(0, 20))

    # Title for download screen
    title_label = tk.Label(
        main_frame,
        text=f"Downloading Firmware v{version}",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 16, "bold"),
    )
    title_label.pack(pady=(0, 25))

    # Frame for Arduino download
    arduino_frame = _create_download_frame(main_frame, "Master Port Firmware")
    arduino_progress, arduino_percent = arduino_frame

    # Frame for NodeMCU download
    nodemcu_frame = _create_download_frame(main_frame, "Slave Port Firmware")
    nodemcu_progress, nodemcu_percent = nodemcu_frame

    # Status message
    status_label = tk.Label(
        main_frame,
        text="Starting download...",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 10, "italic"),
    )
    status_label.pack(pady=(15, 0))

    # Update UI periodically
    root.update()

    # Function to download with progress
    def download_with_progress():
        try:
            # Create directories if they don't exist
            script_dir = os.path.dirname(os.path.abspath(__file__))
            arduino_dir = os.path.join(
                script_dir, "..", "arduino", "bin", "INSPIRE-100_master"
            )
            nodemcu_dir = os.path.join(
                script_dir, "..", "nodemcu", "bin", "INSPIRE-100_slave"
            )

            os.makedirs(arduino_dir, exist_ok=True)
            os.makedirs(nodemcu_dir, exist_ok=True)

            # Construct the correct URLs based on the version
            arduino_url = f"https://raw.githubusercontent.com/sunilmeister/sunilmeister.github.io/refs/heads/main/inspire-100/firmware/fwReleases/{version}/INSPIRE-100_master.ino.mega.hex"
            nodemcu_url = f"https://raw.githubusercontent.com/sunilmeister/sunilmeister.github.io/refs/heads/main/inspire-100/firmware/fwReleases/{version}/INSPIRE-100_slave.ino.nodemcu.bin"

            # Download Arduino firmware file
            status_label.config(text="Downloading Arduino firmware...")
            arduino_dest = os.path.join(arduino_dir, "INSPIRE-100_master.hex")

            _download_file(
                arduino_url, arduino_dest, arduino_progress, arduino_percent, root
            )

            # Download NodeMCU firmware file
            status_label.config(text="Downloading NodeMCU firmware...")
            nodemcu_dest = os.path.join(nodemcu_dir, "INSPIRE-100_slave.bin")

            _download_file(
                nodemcu_url, nodemcu_dest, nodemcu_progress, nodemcu_percent, root
            )

            status_label.config(text="Downloads completed successfully!")

            # Wait a moment before proceeding
            root.after(1000, lambda: show_release_notes(board, version))
            return True

        except Exception as e:
            status_label.config(text=f"Error: {e}")

            # Add a retry button
            retry_button = tk.Button(
                main_frame,
                text="Retry Download",
                command=lambda: download_screen(board, version),
                bg=ACCENT_COLOR,
                fg="white",
                font=("Helvetica", 12, "bold"),
                relief=tk.FLAT,
                padx=20,
                pady=8,
                cursor="hand2",
            )
            retry_button.pack(pady=15)
            return False

    # Start the download process after a short delay
    root.after(500, download_with_progress)


def _create_download_frame(parent, label_text):
    """Create a download frame with progress bar and percentage label."""
    frame = tk.Frame(parent, bg=BACKGROUND_COLOR)
    frame.pack(fill="x", pady=5)

    label = tk.Label(
        frame,
        text=label_text + ":",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 12),
        width=20,
        anchor="w",
    )
    label.pack(side=tk.LEFT, padx=(0, 10))

    progress = ttk.Progressbar(
        frame,
        orient="horizontal",
        length=300,
        mode="determinate",
        style="Custom.Horizontal.TProgressbar",
    )
    progress.pack(side=tk.LEFT, fill="x", expand=True)

    percent = tk.Label(
        frame,
        text="0%",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 10),
        width=5,
    )
    percent.pack(side=tk.LEFT, padx=(5, 0))

    return progress, percent


def _download_file(url, dest, progress_bar, percent_label, root):
    """Download a file with progress tracking."""
    with urllib.request.urlopen(url, timeout=10) as response:
        file_size = int(response.info().get("Content-Length", 0))
        downloaded = 0
        block_size = 8192

        with open(dest, "wb") as out_file:
            while True:
                buffer = response.read(block_size)
                if not buffer:
                    break

                downloaded += len(buffer)
                out_file.write(buffer)

                # Update progress
                if file_size > 0:
                    percent = int((downloaded / file_size) * 100)
                    progress_bar["value"] = percent
                    percent_label.config(text=f"{percent}%")
                    root.update_idletasks()

    progress_bar["value"] = 100
    percent_label.config(text="100%")


def show_release_notes(board, version):
    """
    Display release notes for the selected version before proceeding with installation.

    Args:
        board (str): The board type (Master or Slave)
        version (str): The selected firmware version
    """
    # Destroy all widgets
    for widget in root.winfo_children():
        widget.destroy()

    # Load the image
    photo = load_and_resize_image()

    # Create main frame for better organization
    main_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
    main_frame.pack(fill="both", expand=True, padx=20, pady=20)

    # Add the image at the top
    image_label = tk.Label(main_frame, image=photo, bg=BACKGROUND_COLOR)
    image_label.image = photo
    image_label.pack(pady=(0, 20))

    # Title for release notes
    title_label = tk.Label(
        main_frame,
        text=f"Release Notes for Version {version}",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 16, "bold"),
    )
    title_label.pack(pady=(0, 15))

    # Create text widget for release notes with scrollbar
    notes_frame = tk.Frame(main_frame, bg=BACKGROUND_COLOR, padx=2, pady=2)
    notes_frame.pack(pady=10, fill="both", expand=True)

    notes_text = tk.Text(
        notes_frame,
        height=12,
        width=60,
        bd=0,
        bg="#1E1E1E",
        fg="#F0F0F0",
        font=("Consolas", 10),
        padx=10,
        pady=10,
        wrap=tk.WORD,
    )
    notes_text.pack(fill="both", expand=True)

    # Add a scrollbar to the notes text
    scrollbar = tk.Scrollbar(notes_text)
    scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
    notes_text.config(yscrollcommand=scrollbar.set)
    scrollbar.config(command=notes_text.yview)

    # Try to fetch release notes
    try:
        readme_url = f"https://raw.githubusercontent.com/sunilmeister/sunilmeister.github.io/refs/heads/main/inspire-100/firmware/fwReleases/{version}/README.md"
        with urllib.request.urlopen(readme_url, timeout=5) as response:
            release_notes = response.read().decode()

        # Insert release notes into text widget
        notes_text.insert(tk.END, release_notes)
        notes_text.config(state=tk.DISABLED)  # Make read-only
    except Exception as e:
        notes_text.insert(
            tk.END,
            f"Failed to fetch release notes: {e}\n\nPlease check your internet connection.",
        )
        notes_text.config(state=tk.DISABLED)  # Make read-only

    # Add buttons at the bottom
    button_frame = tk.Frame(main_frame, bg=BACKGROUND_COLOR)
    button_frame.pack(pady=(15, 0), fill="x")

    # Continue button
    continue_button = tk.Button(
        button_frame,
        text="Continue to Connection Instructions",
        command=lambda: show_connection_instructions(board),
        bg=ACCENT_COLOR,
        fg="white",
        font=("Helvetica", 12, "bold"),
        activebackground="#0DD142",
        activeforeground="white",
        relief=tk.FLAT,
        padx=20,
        pady=8,
        cursor="hand2",
    )
    continue_button.pack(side=tk.RIGHT)
