import tkinter as tk
from tkinter import ttk
import urllib.request
import os
import json
import threading

from src.config.config import root
from src.config.color import BACKGROUND_COLOR, TEXT_COLOR, ACCENT_COLOR
from src.ui.utils import load_and_resize_image
from src.uid_installation.uid_installation_screen import show_uid_installation_screen


def download_uid_firmware(version, progress_bar, progress_label, log_text, user_role):
    """Download the UID firmware for the selected version."""
    try:
        # Get current script directory for reliable file paths
        script_dir = os.path.dirname(os.path.abspath(__file__))
        # Path to bin directory (going up one level from uid_installation)
        bin_dir = os.path.join(os.path.dirname(script_dir), "bin")
        
        # Create bin directory if it doesn't exist
        os.makedirs(bin_dir, exist_ok=True)

        # Construct the URL for the UID firmware
        base_url = "https://raw.githubusercontent.com/sunilmeister/sunilmeister.github.io/refs/heads/main/inspire-100/firmware/fwReleases"
        firmware_url = f"{base_url}/{version}/InstallSystemUid.ino.mega.hex"

        # Update UI
        progress_label.config(text="Downloading UID firmware...")
        log_text.insert(tk.END, f"Downloading UID firmware for version {version}...\n")
        root.update_idletasks()

        # Download the firmware
        response = urllib.request.urlopen(firmware_url)
        firmware_data = response.read()

        # Save the firmware
        firmware_path = os.path.join(bin_dir, "InstallSystemUid.ino.mega.hex")
        with open(firmware_path, "wb") as f:
            f.write(firmware_data)

        # Update progress
        progress_bar["value"] = 100
        progress_label.config(text="Download complete!")
        log_text.insert(tk.END, "UID firmware downloaded successfully.\n")
        root.update_idletasks()

        # Wait a moment before proceeding
        root.after(
            1000,
            lambda: show_uid_installation_screen(
                progress_bar, progress_label, log_text, user_role
            ),
        )

        return True

    except Exception as e:
        progress_label.config(text="Download failed!")
        log_text.insert(tk.END, f"Error downloading UID firmware: {str(e)}\n")
        root.update_idletasks()
        return False


def show_uid_download_screen(version, user_role="user"):
    """Display the download screen for UID firmware."""
    # Clear existing widgets
    for widget in root.winfo_children():
        widget.destroy()

    # Create main frame
    main_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
    main_frame.pack(fill="both", expand=True, padx=20, pady=20)

    # Load and display logo
    photo = load_and_resize_image()
    image_label = tk.Label(main_frame, image=photo, bg=BACKGROUND_COLOR)
    image_label.image = photo
    image_label.pack(pady=(0, 20))

    # Title
    title_label = tk.Label(
        main_frame,
        text="Downloading UID Firmware",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 16, "bold"),
    )
    title_label.pack(pady=(0, 20))

    # Progress bar
    progress_bar = ttk.Progressbar(
        main_frame, orient="horizontal", length=400, mode="determinate"
    )
    progress_bar.pack(pady=(0, 10))

    # Progress label
    progress_label = tk.Label(
        main_frame,
        text="Starting download...",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 10),
    )
    progress_label.pack(pady=(0, 10))

    # Log text area
    log_text = tk.Text(
        main_frame,
        height=10,
        width=50,
        bg="black",
        fg="white",
        font=("Courier", 10),
        wrap=tk.WORD,
    )
    log_text.pack(pady=(0, 20))

    # Start download in a separate thread
    download_thread = threading.Thread(
        target=download_uid_firmware,
        args=(version, progress_bar, progress_label, log_text, user_role),
    )
    download_thread.daemon = True
    download_thread.start()
