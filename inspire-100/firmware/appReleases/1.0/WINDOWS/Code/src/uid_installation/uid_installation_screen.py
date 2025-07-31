import tkinter as tk
from tkinter import ttk, messagebox
import serial
import time
import threading
import os
import subprocess

from src.config.config import root
from src.config.color import BACKGROUND_COLOR, TEXT_COLOR, ACCENT_COLOR, SECONDARY_COLOR
from src.ui.utils import load_and_resize_image
from src.utils.utils import find_port
from src.uid_installation.completion_screen import show_completion_screen
from src.uid_installation.barcode_screen import show_barcode_screen
from src.uid_installation.uid_connection_instructions import (
    show_uid_installation_screen,
)
from src.backend.api import deprecate_previous_uid  # Import the new API function


def install_uid_firmware(progress_bar, progress_label, log_text, user_role):
    """Install the UID firmware to the Arduino."""
    try:
        # Find Arduino port
        port = find_port()
        if not port:
            # Show connection instructions and a Try Again button
            for widget in root.winfo_children():
                widget.destroy()
            main_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
            main_frame.pack(fill="both", expand=True, padx=20, pady=20)
            # Load and display logo
            photo = load_and_resize_image()
            image_label = tk.Label(main_frame, image=photo, bg=BACKGROUND_COLOR)
            image_label.image = photo
            image_label.pack(pady=(0, 30))
            connection_message = "Connect the INSPIRE-100 system's master USB port to your laptop's USB port."
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
            try_again_button = tk.Button(
                main_frame,
                text="Try Again",
                command=lambda: install_uid_firmware(
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
            try_again_button.pack(pady=10)
            return False

        # Update UI
        progress_label.config(text="Installing UID firmware...")
        log_text.insert(tk.END, f"Installing UID firmware to {port}...\n")
        root.update_idletasks()

        # Install firmware using arduino-cli
        board = "arduino:avr:mega"
        script_dir = os.path.dirname(os.path.abspath(__file__))
        bin_dir = os.path.join(os.path.dirname(script_dir), "bin")
        firmware_path = os.path.join(bin_dir, "InstallSystemUid.ino.mega.hex")

        upload_process = subprocess.Popen(
            [
                "arduino-cli",
                "upload",
                "-b",
                board,
                "-p",
                port,
                "--input-file",
                firmware_path,
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
        )
        stdout, stderr = upload_process.communicate()

        if upload_process.returncode != 0:
            # Clear existing widgets
            for widget in root.winfo_children():
                widget.destroy()
            # Show error UI
            main_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
            main_frame.pack(fill="both", expand=True, padx=20, pady=20)
            # Error message
            error_label = tk.Label(
                main_frame,
                text="Firmware installation failed!\nMake sure no other program (Arduino IDE, serial monitor, etc.) is using the port (e.g., COM7).\nTry unplugging and replugging the device.",
                bg=BACKGROUND_COLOR,
                fg="red",
                font=("Helvetica", 12, "bold"),
                wraplength=400,
                justify="center",
            )
            error_label.pack(pady=(0, 20))
            # Log area
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
            log_text.insert(tk.END, f"Error installing firmware: {stderr}\n")
            # Try Again button
            try_again_button = tk.Button(
                main_frame,
                text="Try Again",
                command=lambda: show_uid_installation_screen(
                    progress_bar, progress_label, log_text, user_role
                ),
                bg=ACCENT_COLOR,
                fg="white",
                font=("Helvetica", 12),
                relief=tk.FLAT,
                padx=20,
                pady=8,
                cursor="hand2",
            )
            try_again_button.pack(pady=10)
            return False

        log_text.insert(tk.END, "UID firmware installed successfully.\n")
        progress_bar["value"] = 100
        progress_label.config(text="Installation complete!")
        root.update_idletasks()

        # Wait a moment before proceeding to UID check
        root.after(
            1000,
            lambda: check_existing_uid(
                progress_bar, progress_label, log_text, user_role
            ),
        )
        return True

    except Exception as e:
        log_text.insert(tk.END, f"Error during installation: {str(e)}\n")
        return False


def check_existing_uid(progress_bar, progress_label, log_text, user_role):
    """Check if the system already has a UID installed."""
    try:
        port = find_port()
        if not port:
            log_text.insert(
                tk.END, "No Arduino board found. Please connect the board.\n"
            )
            return

        # Open serial connection
        ser = serial.Serial(port, 115200, timeout=1)
        time.sleep(2)  # Wait for Arduino to reset

        # Send Hello command
        ser.write(b"H")
        response = ser.readline().decode().strip()

        if response != "H":
            log_text.insert(tk.END, "Error: No response from system.\n")
            ser.close()
            return

        # Send UID request
        ser.write(b"U")
        uid = ser.readline().decode().strip()
        ser.close()

        if uid and len(uid) == 16:
            show_uid_confirmation_screen(
                uid, progress_bar, progress_label, log_text, user_role
            )
        else:
            show_uid_input_screen(progress_bar, progress_label, log_text, user_role)

    except Exception as e:
        log_text.insert(tk.END, f"Error checking UID: {str(e)}\n")


def show_uid_confirmation_screen(
    existing_uid, progress_bar, progress_label, log_text, user_role
):
    """Show screen with existing UID and option to change it."""

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

    # Title
    title_label = tk.Label(
        main_frame,
        text="Existing UID Found",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 16, "bold"),
    )
    title_label.pack(pady=(0, 20))

    # Display existing UID
    uid_label = tk.Label(
        main_frame,
        text=f"Current UID: {existing_uid}",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 12),
    )
    uid_label.pack(pady=(0, 20))

    # Buttons frame
    button_frame = tk.Frame(main_frame, bg=BACKGROUND_COLOR)
    button_frame.pack(pady=20)

    # Change UID button
    change_button = tk.Button(
        button_frame,
        text="Change UID",
        command=lambda: show_uid_input_screen(
            progress_bar, progress_label, log_text, user_role
        ),
        bg=ACCENT_COLOR,
        fg="white",
        font=("Helvetica", 12),
        relief=tk.FLAT,
        padx=20,
        pady=8,
        cursor="hand2",
    )
    change_button.pack(side=tk.LEFT, padx=10)

    # Keep existing button
    keep_button = tk.Button(
        button_frame,
        text="Keep Existing",
        command=lambda: show_version_selection_page(user_role),
        bg=SECONDARY_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 12),
        relief=tk.FLAT,
        padx=20,
        pady=8,
        cursor="hand2",
    )
    keep_button.pack(side=tk.LEFT, padx=10)


def show_uid_input_screen(progress_bar, progress_label, log_text, user_role):
    """Show screen for entering new UID."""
    # Clear existing widgets
    for widget in root.winfo_children():
        widget.destroy()
    main_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
    main_frame.pack(fill="both", expand=True, padx=10, pady=10)

    # Load and display logo
    photo = load_and_resize_image()
    image_label = tk.Label(main_frame, image=photo, bg=BACKGROUND_COLOR)
    image_label.image = photo
    image_label.pack(pady=(0, 20))

    # Title
    title_label = tk.Label(
        main_frame,
        text="Enter New UID",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 16, "bold"),
    )
    title_label.pack(pady=(0, 20))

    # UID input frame
    input_frame = tk.Frame(main_frame, bg=BACKGROUND_COLOR)
    input_frame.pack(pady=20)

    # UID entry with auto-uppercase conversion
    uid_var = tk.StringVar()

    def on_uid_change(*args):
        """Convert UID input to uppercase automatically."""
        current_value = uid_var.get()
        upper_value = current_value.upper()
        if current_value != upper_value:
            uid_var.set(upper_value)

    uid_var.trace("w", on_uid_change)  # Watch for changes to auto-convert to uppercase

    uid_entry = tk.Entry(
        input_frame, textvariable=uid_var, font=("Helvetica", 12), width=20
    )
    uid_entry.pack(pady=10)

    # Validation function
    def validate_uid():
        uid = uid_var.get().strip().upper()  # Convert to uppercase for validation
        if not uid or len(uid) != 16:
            messagebox.showerror("Invalid UID", "Please enter a 16-character UID")
            return False
        return True

    # Install button
    install_button = tk.Button(
        main_frame,
        text="Install UID",
        command=lambda: (
            install_new_uid(
                uid_var.get().strip().upper(), None, None, None, user_role
            )  # Convert to uppercase before installation
            if validate_uid()
            else None
        ),
        bg=ACCENT_COLOR,
        fg="white",
        font=("Helvetica", 12),
        relief=tk.FLAT,
        padx=20,
        pady=8,
        cursor="hand2",
    )
    install_button.pack(pady=20)


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
    message_label.pack(pady=(0, 20))

    # Button frame
    button_frame = tk.Frame(main_frame, bg=BACKGROUND_COLOR)
    button_frame.pack(pady=20)

    # Return to version selection button
    return_button = tk.Button(
        button_frame,
        text="Return to Version Selection",
        command=lambda: show_version_selection_page(user_role),
        bg=ACCENT_COLOR,
        fg="white",
        font=("Helvetica", 12),
        relief=tk.FLAT,
        padx=20,
        pady=8,
        cursor="hand2",
    )
    return_button.pack()


def install_new_uid(uid, progress_bar, progress_label, log_text, user_role):
    """Install the new UID to the system."""
    existing_uid = None  # Track existing UID to deprecate it later

    try:
        from src.uid_installation.barcode_screen import show_barcode_screen

        port = find_port()
        if not port:
            # Show connection instructions and a Try Again button
            for widget in root.winfo_children():
                widget.destroy()
            main_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
            main_frame.pack(fill="both", expand=True, padx=20, pady=20)
            # Load and display logo
            photo = load_and_resize_image()
            image_label = tk.Label(main_frame, image=photo, bg=BACKGROUND_COLOR)
            image_label.image = photo
            image_label.pack(pady=(0, 30))
            connection_message = "Connect the INSPIRE-100 system's master USB port to your laptop's USB port."
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
            try_again_button = tk.Button(
                main_frame,
                text="Try Again",
                command=lambda: install_new_uid(
                    uid, progress_bar, progress_label, log_text, user_role
                ),
                bg=ACCENT_COLOR,
                fg="white",
                font=("Helvetica", 12, "bold"),
                relief=tk.FLAT,
                padx=30,
                pady=8,
                cursor="hand2",
            )
            try_again_button.pack(pady=10)
            return

        # Open serial connection
        ser = serial.Serial(port, 115200, timeout=1)
        time.sleep(2)  # Wait for Arduino to reset

        # Send Hello command
        ser.write(b"H")
        response = ser.readline().decode().strip()

        if response != "H":
            log_text.insert(tk.END, "Error: No response from system.\n")
            ser.close()
            return

        # Get existing UID before installing new one (for deprecation later)
        try:
            ser.write(b"U")
            existing_uid_response = ser.readline().decode().strip()
            if existing_uid_response and len(existing_uid_response) == 16:
                existing_uid = existing_uid_response
                if log_text:
                    log_text.insert(tk.END, f"Found existing UID: {existing_uid}\n")
            elif log_text:
                log_text.insert(
                    tk.END, "No existing UID found or invalid UID length.\n"
                )
        except Exception as e:
            if log_text:
                log_text.insert(
                    tk.END, f"Warning: Could not retrieve existing UID: {str(e)}\n"
                )

        # Send Install UID command
        command = f"I {uid}"
        ser.write(command.encode())
        installed_uid = ser.readline().decode().strip()
        ser.close()

        # Compare UIDs in uppercase since echoed UID is always uppercase
        if installed_uid.upper() == uid.upper():
            # Open serial connection again to send 'X' for restart
            try:
                ser = serial.Serial(port, 115200, timeout=1)
                time.sleep(0.5)
                ser.write(b"X")
                time.sleep(
                    0.5
                )  # Small delay to allow the system to process the restart command
                ser.close()
            except Exception as e:
                # Optionally log or ignore errors in restart
                pass

            # Deprecate the previous UID if it exists and is different from the new one
            if existing_uid and existing_uid.upper() != uid.upper():
                if log_text:
                    log_text.insert(
                        tk.END, f"Deprecating previous UID: {existing_uid}\n"
                    )
                try:
                    deprecation_success = deprecate_previous_uid(existing_uid)
                    if deprecation_success:
                        if log_text:
                            log_text.insert(
                                tk.END,
                                f"Successfully deprecated previous UID: {existing_uid}\n",
                            )
                    else:
                        if log_text:
                            log_text.insert(
                                tk.END,
                                f"Warning: Failed to deprecate previous UID: {existing_uid}\n",
                            )
                except Exception as deprecation_error:
                    if log_text:
                        log_text.insert(
                            tk.END,
                            f"Error deprecating previous UID: {str(deprecation_error)}\n",
                        )
            elif existing_uid and existing_uid.upper() == uid.upper():
                if log_text:
                    log_text.insert(
                        tk.END, "No deprecation needed - same UID reinstalled.\n"
                    )

            show_completion_screen(installed_uid, user_role)
        else:
            messagebox.showerror(
                "Error",
                f"Failed to install UID. Expected: {uid.upper()}, Got: {installed_uid}",
            )

    except Exception as e:
        try:
            log_text.insert(tk.END, f"Error installing UID: {str(e)}\n")
        except Exception:
            pass
