import tkinter as tk
from tkinter import ttk

from src.config.config import root
from src.config.color import BACKGROUND_COLOR, TEXT_COLOR, ACCENT_COLOR
from src.ui.utils import load_and_resize_image


def show_completion_screen(installed_uid, user_role):
    """Show completion screen after successful UID installation."""
    from src.ui.version_selection_page import show_version_selection_page

    # Clear existing widgets
    for widget in root.winfo_children():
        widget.destroy()

    main_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
    main_frame.pack(fill="both", expand=True, padx=20, pady=20)

    # Load and display logo
    photo = load_and_resize_image()
    image_label = tk.Label(main_frame, image=photo, bg=BACKGROUND_COLOR)
    image_label.image = photo
    image_label.pack(pady=(0, 20))

    # Success icon (using text as a simple icon)
    success_label = tk.Label(
        main_frame,
        text="✓",
        bg=BACKGROUND_COLOR,
        fg="green",
        font=("Helvetica", 48, "bold"),
    )
    success_label.pack(pady=(0, 20))

    # Title
    title_label = tk.Label(
        main_frame,
        text="UID Installation Complete",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 16, "bold"),
    )
    title_label.pack(pady=(0, 20))

    # Installed UID
    uid_label = tk.Label(
        main_frame,
        text=f"Installed UID: {installed_uid}",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 12),
    )
    uid_label.pack(pady=(0, 20))

    # Success message
    message_label = tk.Label(
        main_frame,
        text="The UID has been successfully installed to the system.",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 10),
    )
    message_label.pack(pady=(0, 15))

    # Important firmware installation reminder
    firmware_reminder_label = tk.Label(
        main_frame,
        text="⚠️ IMPORTANT: You must now install firmware for proper system functioning.\nWithout proper firmware, the system will not operate correctly.",
        bg=BACKGROUND_COLOR,
        fg="red",
        font=("Helvetica", 12, "bold"),
        wraplength=450,
        justify="center",
    )
    firmware_reminder_label.pack(pady=(0, 25))

    # Button frame
    button_frame = tk.Frame(main_frame, bg=BACKGROUND_COLOR)
    button_frame.pack(pady=20)

    # Install Firmware Button (primary action)
    install_firmware_button = tk.Button(
        button_frame,
        text="Install Firmware Now",
        command=lambda: show_version_selection_page(user_role),
        bg=ACCENT_COLOR,
        fg="white",
        font=("Helvetica", 12, "bold"),
        relief=tk.FLAT,
        padx=20,
        pady=8,
        cursor="hand2",
    )
    install_firmware_button.pack(side=tk.LEFT, padx=(0, 10))

    # Return to version selection button (secondary action)
    return_button = tk.Button(
        button_frame,
        text="Continue Later",
        command=lambda: show_version_selection_page(user_role),
        bg="gray",
        fg="white",
        font=("Helvetica", 12),
        relief=tk.FLAT,
        padx=20,
        pady=8,
        cursor="hand2",
    )
    return_button.pack(side=tk.LEFT)
