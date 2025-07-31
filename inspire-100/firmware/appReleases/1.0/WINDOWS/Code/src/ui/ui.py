from src.config.config import root
from src.config.color import BACKGROUND_COLOR, TEXT_COLOR, ACCENT_COLOR, SECONDARY_COLOR

import tkinter as tk
from PIL import Image, ImageTk
import os

version_var = tk.StringVar(root)


def show_retry_ui(version_dropdown):
    from src.ui.version_selection_page import fetch_versions

    """Show an error message and retry button if fetching versions fails."""
    for widget in root.winfo_children():
        widget.destroy()

    error_label = tk.Label(
        root,
        text="Failed to fetch versions. Check your internet connection.",
        bg=BACKGROUND_COLOR,
        fg="red",
        font=("Helvetica", 12, "bold"),
    )
    error_label.pack(pady=10)

    # Use lambda to properly defer the execution of fetch_versions
    retry_button = tk.Button(
        root,
        text="Retry",
        command=lambda: fetch_versions(version_dropdown),
        bg=ACCENT_COLOR,
        fg="white",
        font=("Helvetica", 12, "bold"),
        relief=tk.FLAT,
        padx=20,
        pady=8,
        cursor="hand2",
        activebackground="#0DD142",
    )
    retry_button.pack(pady=10)


def show_completion_screen(user_role="user"):
    """
    Display a completion screen after successful firmware installation.
    Args:
        user_role (str): Role of the logged-in user (default is 'user')
    """

    from src.ui.version_selection_page import show_version_selection_page

    # Destroy all existing widgets
    for widget in root.winfo_children():
        widget.destroy()

    # Load the completion image (optional, replace with your own image)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(
        script_dir, "assets", "logo.png"
    )  # Update with a real success image
    try:
        original_image = Image.open(image_path)

        # Resize the image while maintaining aspect ratio
        desired_width = 400
        aspect_ratio = original_image.width / original_image.height
        desired_height = int(desired_width / aspect_ratio)
        resized_image = original_image.resize((desired_width, desired_height))
        photo = ImageTk.PhotoImage(resized_image)

        # Create image label
        image_label = tk.Label(root, image=photo, bg=BACKGROUND_COLOR)
        image_label.image = photo  # Keep a reference to the image
        image_label.pack(pady=(20, 10))
    except Exception as e:
        print("Error loading image:", e)

    # Success message
    success_label = tk.Label(
        root,
        text="🎉 Firmware Installation Complete! 🎉",
        bg=BACKGROUND_COLOR,
        fg="green",
        font=("Helvetica", 18, "bold"),
        wraplength=400,
        justify="center",
    )
    success_label.pack(pady=(10, 10))

    # Additional instructions
    instructions_label = tk.Label(
        root,
        text="You can now disconnect the board and start using your device.",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 14),
        wraplength=400,
        justify="center",
    )
    instructions_label.pack(pady=(0, 20))

    # Button frame for better organization
    button_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
    button_frame.pack(pady=10)

    # Return to version selection button
    return_button = tk.Button(
        button_frame,
        text="Return to Version Selection",
        command=lambda: show_version_selection_page(user_role),
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
    return_button.pack(side=tk.LEFT, padx=(0, 10))

    # Exit button
    exit_button = tk.Button(
        button_frame,
        text="Exit",
        command=root.quit,
        bg=SECONDARY_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 12),
        relief=tk.FLAT,
        padx=20,
        pady=8,
        cursor="hand2",
    )
    exit_button.pack(side=tk.LEFT)


def show_registration_screen(user_role="user"):
    """
    Display a screen to show the system UID and firmware version after registering the installation.
    Args:
        user_role (str): Role of the logged-in user (default is 'user')
    """
    from src.backend.api import register_firmware_completion  # Import the function

    # Destroy all existing widgets
    for widget in root.winfo_children():
        widget.destroy()

    # Register firmware installation and get system info
    try:
        system_uid, firmware_version = register_firmware_completion()
        if not system_uid or not firmware_version:
            raise ValueError("Failed to register firmware installation.")
    except Exception as e:
        error_label = tk.Label(
            root,
            text=f"Error: {e}",
            bg=BACKGROUND_COLOR,
            fg="red",
            font=("Helvetica", 12, "bold"),
            wraplength=400,
            justify="center",
        )
        error_label.pack(pady=(20, 10))
        return

    # Display the system UID
    uid_label = tk.Label(
        root,
        text=f"System UID: {system_uid}",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 14),
        wraplength=400,
        justify="center",
    )
    uid_label.pack(pady=(10, 10))

    # Display the firmware version
    version_label = tk.Label(
        root,
        text=f"Firmware Version: {firmware_version}",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 14),
        wraplength=400,
        justify="center",
    )
    version_label.pack(pady=(10, 10))

    # Success message
    success_label = tk.Label(
        root,
        text="Firmware installation has been successfully registered!",
        bg=BACKGROUND_COLOR,
        fg="green",
        font=("Helvetica", 14, "bold"),
        wraplength=400,
        justify="center",
    )
    success_label.pack(pady=(10, 10))

    # Continue button to proceed to the completion screen
    continue_button = tk.Button(
        root,
        text="Continue",
        command=lambda: show_completion_screen(
            user_role
        ),  # Pass user_role to completion screen
        bg=ACCENT_COLOR,
        fg="white",
        font=("Helvetica", 12, "bold"),
        activebackground="#0DD142",
        activeforeground="white",
        relief=tk.FLAT,
        padx=30,
        pady=8,
        cursor="hand2",
    )
    continue_button.pack(pady=(20, 10))


def show_connect_master_screen(user_role="user"):
    """
    Display a screen instructing the user to reconnect the master port before starting the registration process.
    Args:
        user_role (str): Role of the logged-in user (default is 'user')
    """
    # Destroy all existing widgets
    for widget in root.winfo_children():
        widget.destroy()

    # Instruction message
    instruction_label = tk.Label(
        root,
        text="Please reconnect the Master port to proceed with the registration process.",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 14, "bold"),
        wraplength=400,
        justify="center",
    )
    instruction_label.pack(pady=(20, 10))

    # Continue button to proceed to the registration screen
    continue_button = tk.Button(
        root,
        text="Continue",
        command=lambda: show_registration_screen(
            user_role
        ),  # Pass user_role to registration screen
        bg=ACCENT_COLOR,
        fg="white",
        font=("Helvetica", 12, "bold"),
        activebackground="#0DD142",
        activeforeground="white",
        relief=tk.FLAT,
        padx=30,
        pady=8,
        cursor="hand2",
    )
    continue_button.pack(pady=(20, 10))
