from src.config.config import root
from src.config.color import BACKGROUND_COLOR, TEXT_COLOR, SECONDARY_COLOR, ACCENT_COLOR
import tkinter as tk
import threading
from tkinter import ttk

from src.utils.utils import get_arduino_cli_command


def show_erase_confirmation_page(board_type, erase_type):
    """
    Display confirmation page after successful erase operation.

    Args:
        board_type (str): Type of board ('Arduino Mega 2560' or 'NodeMCU').
        erase_type (str): Type of erase ('ROM' or 'EPROM').
    """

    from src.ui.version_selection_page import show_version_selection_page

    # Clear existing widgets
    for widget in root.winfo_children():
        widget.destroy()

    # Main frame
    main_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
    main_frame.pack(fill="both", expand=True, padx=20, pady=20)

    # Title
    title_label = tk.Label(
        main_frame,
        text=f"{erase_type} Erase Successful",
        bg=BACKGROUND_COLOR,
        fg=ACCENT_COLOR,
        font=("Helvetica", 16, "bold"),
    )
    title_label.pack(pady=(20, 15))

    # Description
    description_label = tk.Label(
        main_frame,
        text=f"The {erase_type} for {board_type} has been successfully erased.\n",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 12),
        wraplength=440,
        justify="center",
    )
    description_label.pack(pady=(0, 20))

    # Continue Button
    continue_button = tk.Button(
        main_frame,
        text="Continue",
        bg=ACCENT_COLOR,
        fg="white",
        font=("Helvetica", 12, "bold"),
        command=lambda: show_version_selection_page(user_role="admin"),
        relief=tk.FLAT,
        padx=20,
        pady=10,
    )
    continue_button.pack(pady=10)


def show_erase_page(board_type, erase_type):
    """
    Display page for erasing ROM or EPROM.

    Args:
        board_type (str): Type of board ('Arduino Mega 2560' or 'NodeMCU').
        erase_type (str): Type of erase ('ROM' or 'EPROM').
    """
    from src.ui.version_selection_page import show_version_selection_page
    from src.utils.erasing import perform_erase

    # Clear existing widgets
    for widget in root.winfo_children():
        widget.destroy()

    # Main frame
    main_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
    main_frame.pack(fill="both", expand=True, padx=20, pady=20)

    # Title
    title_label = tk.Label(
        main_frame,
        text=f"Erase {erase_type} - {board_type}",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 16, "bold"),
    )
    title_label.pack(pady=(20, 30))

    # Description
    description_label = tk.Label(
        main_frame,
        text=f"Warning: This will permanently erase the {erase_type}.\n",
        bg=BACKGROUND_COLOR,
        fg="red",
        font=("Helvetica", 12),
    )
    description_label.pack(pady=(0, 30))

    # Run arduino CLI check when this page is shown
    run_arduino_cli_with_progress()

    # Confirmation Button
    confirm_button = tk.Button(
        main_frame,
        text="Confirm Erase",
        bg="red",
        fg="white",
        font=("Helvetica", 12, "bold"),
        command=lambda: perform_erase(board_type, erase_type),
        relief=tk.FLAT,
        padx=20,
        pady=10,
    )
    confirm_button.pack(pady=20)

    # Cancel Button
    cancel_button = tk.Button(
        main_frame,
        text="Cancel",
        bg=SECONDARY_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 12),
        command=lambda: show_version_selection_page(user_role="admin"),
        relief=tk.FLAT,
        padx=20,
        pady=10,
    )
    cancel_button.pack(pady=10)


def show_error(message):
    """
    Show an error message in a popup.

    Args:
        message (str): Error message to display.
    """
    error_window = tk.Toplevel(root)
    error_window.title("Error")
    error_window.geometry("300x150")
    error_window.configure(bg=BACKGROUND_COLOR)

    error_label = tk.Label(
        error_window,
        text=message,
        bg=BACKGROUND_COLOR,
        fg="red",
        font=("Helvetica", 12),
        wraplength=280,
    )
    error_label.pack(pady=20)

    ok_button = tk.Button(
        error_window,
        text="OK",
        bg=SECONDARY_COLOR,
        fg=TEXT_COLOR,
        command=error_window.destroy,
    )
    ok_button.pack(pady=10)


def update_progress(canvas, width, label, text):
    """
    Update the progress bar and label in the main thread.

    Args:
        canvas (tk.Canvas): Canvas widget for progress bar.
        width (int): Width of the progress bar.
        label (tk.Label): Text to display in the label.
        text (str): Text to display in the label.
    """
    canvas.delete("progress")
    canvas.create_rectangle(0, 0, width, 20, fill=ACCENT_COLOR, tags="progress")
    label.config(text=text)


def run_arduino_cli_with_progress():
    """
    Show a progress dialog while running arduino-cli command in a separate thread.
    This prevents the UI from freezing.
    """

    # Clear existing widgets
    for widget in root.winfo_children():
        widget.destroy()

    # Create a progress window
    progress_window = tk.Toplevel(root)
    progress_window.title("Running Arduino CLI")
    progress_window.geometry("400x150")
    progress_window.configure(bg=BACKGROUND_COLOR)
    progress_window.transient(root)
    progress_window.grab_set()  # Make window modal

    # Add a progress message
    message_label = tk.Label(
        progress_window,
        text="Running Arduino CLI command...",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 12),
    )
    message_label.pack(pady=(20, 10))

    # Add progress bar
    progress_bar = ttk.Progressbar(
        progress_window, orient="horizontal", length=300, mode="indeterminate"
    )
    progress_bar.pack(pady=10)
    progress_bar.start(10)

    # Function to be executed in a separate thread
    def run_cli_command():
        try:
            result = get_arduino_cli_command()
            # When complete, update UI from the main thread
            root.after(0, lambda: command_completed(progress_window, result))
        except Exception as e:
            # Handle exceptions in the main thread
            root.after(0, lambda: show_error(f"Error executing Arduino CLI: {str(e)}"))
            root.after(0, progress_window.destroy)

    # Function to handle completion
    def command_completed(window, result):
        window.destroy()
        # Here you can add any additional handling for the result
        # For example, display success message or next steps

    # Start the thread
    thread = threading.Thread(target=run_cli_command)
    thread.daemon = True  # Thread will be terminated when main program exits
    thread.start()
