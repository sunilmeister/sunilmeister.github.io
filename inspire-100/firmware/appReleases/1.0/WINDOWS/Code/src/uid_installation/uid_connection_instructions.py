import tkinter as tk
from tkinter import ttk
import threading
from src.config.config import root
from src.config.color import BACKGROUND_COLOR, TEXT_COLOR, ACCENT_COLOR
from src.ui.utils import load_and_resize_image


def show_uid_connection_instructions(progress_bar, progress_label, log_text, user_role):
    """Show connection instructions before UID installation."""
    for widget in root.winfo_children():
        widget.destroy()
    main_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
    main_frame.pack(fill="both", expand=True, padx=20, pady=20)
    # Load and display logo
    photo = load_and_resize_image()
    image_label = tk.Label(main_frame, image=photo, bg=BACKGROUND_COLOR)
    image_label.image = photo
    image_label.pack(pady=(0, 30))
    connection_message = (
        "Connect the INSPIRE-100 system's master USB port to your laptop's USB port."
    )
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

    # Power warning - CRITICAL SAFETY MESSAGE
    power_warning_label = tk.Label(
        main_frame,
        text="⚠️ IMPORTANT: Ensure the system is powered ON before connecting USB ports.\nDo NOT power the system through USB as this may damage the device.",
        bg=BACKGROUND_COLOR,
        fg="orange",
        font=("Helvetica", 12, "bold"),
        wraplength=400,
        justify="center",
    )
    power_warning_label.pack(pady=(0, 15))

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
    start_button = tk.Button(
        main_frame,
        text="Start UID Installation",
        command=lambda: show_uid_installation_screen_real(
            progress_bar, progress_label, log_text, user_role
        ),
        bg=ACCENT_COLOR,
        fg="white",
        font=("Helvetica", 12, "bold"),
        relief=tk.FLAT,
        padx=30,
        pady=8,
        cursor="hand2",
    )
    start_button.pack(pady=10)


def show_uid_installation_screen_real(
    progress_bar, progress_label, log_text, user_role
):
    """Actual UID installation screen (called after connection instructions)."""
    # Import here to avoid circular import
    from src.uid_installation.uid_installation_screen import install_uid_firmware

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

    # Title
    title_label = tk.Label(
        main_frame,
        text="Installing UID Firmware",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 16, "bold"),
    )
    title_label.pack(pady=(0, 20))

    # Progress bar
    progress_bar = ttk.Progressbar(
        main_frame,
        orient="horizontal",
        length=400,
        mode="determinate",
        style="TProgressbar",
    )
    progress_bar.pack(pady=(0, 10))

    # Progress label
    progress_label = tk.Label(
        main_frame,
        text="Starting installation...",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 10),
    )
    progress_label.pack(pady=(0, 10))

    # Log text area with scrollbar
    log_frame = tk.Frame(main_frame, bg=BACKGROUND_COLOR)
    log_frame.pack(fill="both", expand=True, pady=(0, 20))

    log_text = tk.Text(
        log_frame,
        height=10,
        width=50,
        bg="black",
        fg="white",
        font=("Courier", 10),
        wrap=tk.WORD,
    )
    log_text.pack(side=tk.LEFT, fill="both", expand=True)

    scrollbar = ttk.Scrollbar(log_frame, orient="vertical", command=log_text.yview)
    scrollbar.pack(side=tk.RIGHT, fill="y")
    log_text.configure(yscrollcommand=scrollbar.set)

    # Start installation in a separate thread
    install_thread = threading.Thread(
        target=install_uid_firmware,
        args=(progress_bar, progress_label, log_text, user_role),
    )
    install_thread.daemon = True
    install_thread.start()


def show_uid_installation_screen(progress_bar, progress_label, log_text, user_role):
    """Display the UID installation connection instructions first, then proceed."""
    show_uid_connection_instructions(progress_bar, progress_label, log_text, user_role)
