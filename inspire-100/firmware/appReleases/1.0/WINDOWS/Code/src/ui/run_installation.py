from src.config.config import root
from src.config.color import BACKGROUND_COLOR, TEXT_COLOR, ACCENT_COLOR
from src.ui.utils import load_and_resize_image
from src.arduino.arduino import startArduino
from src.nodemcu.nodemcu import startNode

import tkinter as tk
from tkinter import ttk
import time


def show_connection_instructions(board):
    """
    Display connection instructions before proceeding with installation.

    Args:
        board (str): The board type (Master or Slave)
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
    image_label.image = photo  # Keep a reference to the image
    image_label.pack(pady=(0, 30))

    # Determine the correct connection message
    if board.lower() == "master":
        connection_message = "Connect the INSPIRE-100 system's master USB port to your laptop's USB port."
    elif board.lower() == "slave":
        connection_message = "Connect the INSPIRE-100 system's slave USB port. to your laptop's USB port."
    else:
        connection_message = "Unknown board type. Please check your connection."

    # Connection instructions label
    new_label = tk.Label(
        main_frame,
        text=connection_message,
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 16),
        wraplength=360,
        justify="center",
    )
    new_label.pack(pady=(0, 20))

    # Additional instruction: Only one board should be connected
    warning_label = tk.Label(
        main_frame,
        text="⚠️ Ensure only one USB is connected at a time to avoid conflicts.",
        bg=BACKGROUND_COLOR,
        fg="yellow",
        font=("Helvetica", 14, "bold"),
        wraplength=360,
        justify="center",
    )
    warning_label.pack(pady=(0, 30))

    # Add new button with improved styling
    new_button = tk.Button(
        main_frame,
        text="Start Installation",
        command=lambda: run_installation(board),
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
    new_button.pack(pady=10)


def run_installation(board):
    """
    Run the firmware installation process for a specific board.

    Args:
        board (str): The board type (Master or Slave)
    """
    progress_bar = None
    progress_label = None
    log_text = None

    for widget in root.winfo_children():
        widget.destroy()

    time.sleep(1)

    # Load the image
    photo = load_and_resize_image()

    # Create a frame for better organization
    main_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
    main_frame.pack(fill="both", expand=True, padx=20, pady=20)

    # Add the image at the top
    image_label = tk.Label(main_frame, image=photo, bg=BACKGROUND_COLOR)
    image_label.image = photo
    image_label.pack(pady=(0, 20))

    # Progress Label with improved styling
    progress_label = tk.Label(
        main_frame,
        text="Progress: 0%",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 12),
    )
    progress_label.pack(padx=10, pady=(10, 5), anchor="w")

    # Style the progress bar
    style = ttk.Style()
    style.theme_use("default")
    style.configure(
        "Custom.Horizontal.TProgressbar",
        background=ACCENT_COLOR,
        troughcolor="#E0E0E0",
        thickness=10,
        borderwidth=0,
    )

    # Progress bar with rounded corners effect
    progress_bar = ttk.Progressbar(
        main_frame,
        orient="horizontal",
        length=500,
        mode="determinate",
        style="Custom.Horizontal.TProgressbar",
    )
    progress_bar.pack(pady=(0, 15), ipady=2)

    # Log text with improved styling
    frame = tk.Frame(main_frame, bg=BACKGROUND_COLOR, padx=2, pady=2)
    frame.pack(pady=10, fill="both", expand=True)

    log_text = tk.Text(
        frame,
        height=8,
        width=47,
        bd=0,
        bg="#1E1E1E",
        fg="#F0F0F0",
        font=("Consolas", 10),
        padx=10,
        pady=10,
        insertbackground="#FFFFFF",  # Cursor color
    )
    log_text.pack(fill="both", expand=True)

    # Add a scrollbar to the log
    scrollbar = tk.Scrollbar(log_text)
    scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
    log_text.config(yscrollcommand=scrollbar.set)
    scrollbar.config(command=log_text.yview)

    if board == "Master":
        startArduino(
            progress_bar=progress_bar, progress_label=progress_label, log_text=log_text
        )
    else:
        startNode(
            progress_bar=progress_bar, progress_label=progress_label, log_text=log_text
        )
