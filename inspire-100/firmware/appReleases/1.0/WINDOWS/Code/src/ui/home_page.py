import tkinter as tk
from tkinter import messagebox
import threading
import requests
from src.config.config import root
from src.config.color import BACKGROUND_COLOR, TEXT_COLOR, ACCENT_COLOR
from src.ui.utils import load_and_resize_image
from src.ui.version_selection_page import show_version_selection_page


class HomePage:
    def __init__(self):
        """Initialize the home page of the application."""
        self.root = root
        self.current_version = "1.0"
        self.get_started_button = None
        self.create_home_page()

        # Start version check in background
        threading.Thread(target=self.check_for_updates, daemon=True).start()

    def create_home_page(self):
        """Create and display the home page."""
        # Clear any existing widgets
        for widget in self.root.winfo_children():
            widget.destroy()

        # Load the logo
        photo = load_and_resize_image()

        # Main frame
        main_frame = tk.Frame(self.root, bg=BACKGROUND_COLOR)
        main_frame.pack(fill="both", expand=True, padx=20, pady=10)

        # Logo
        logo_label = tk.Label(main_frame, image=photo, bg=BACKGROUND_COLOR)
        logo_label.image = photo
        logo_label.pack(pady=(0, 30))

        # Title
        title_label = tk.Label(
            main_frame,
            text="TekMedika\nFirmware Update Tool",
            bg=BACKGROUND_COLOR,
            fg=TEXT_COLOR,
            font=("Helvetica", 20, "bold"),
            justify=tk.CENTER,
        )
        title_label.pack(pady=(0, 20))

        # Description
        description_text = (
            "Welcome to the official TekMedika firmware update utility.\n"
            "This tool allows you to safely update the firmware on your\n"
            "systems.\n\n"
        )
        description_label = tk.Label(
            main_frame,
            text=description_text,
            bg=BACKGROUND_COLOR,
            fg=TEXT_COLOR,
            font=("Helvetica", 12),
            justify=tk.CENTER,
            wraplength=440,
        )
        description_label.pack(pady=(0, 30))

        # Get Started Button - initially shows checking for updates
        self.get_started_button = tk.Button(
            main_frame,
            text="Checking for updates...",
            command=self.go_to_next_page,
            bg=ACCENT_COLOR,
            fg="white",
            font=("Helvetica", 14, "bold"),
            relief=tk.FLAT,
            padx=20,
            pady=12,
            cursor="watch",  # Change cursor to indicate processing
            width=18,
            state=tk.DISABLED,  # Disable button during check
        )
        self.get_started_button.pack(pady=(20, 0))

    def check_for_updates(self):
        """Check for updates in the background."""
        try:
            # URL for the releases JSON file
            url = "https://github.com/sunilmeister/sunilmeister.github.io/raw/main/inspire-100/firmware/appReleases/appReleases.json"

            # Fetch the JSON file
            response = requests.get(url, timeout=5)
            releases = response.json()

            # Get the latest release version
            latest_release = releases[0]["release"] if releases else "0.0"

            # Compare versions (simple string comparison, may need improvement for semantic versioning)
            if latest_release > self.current_version:
                # Schedule showing the update notification on the main thread
                self.root.after(
                    0, lambda: self.show_update_notification(latest_release)
                )

        except Exception as e:
            print(f"Error checking for updates: {e}")
        finally:
            # Update button text and state on the main thread
            self.root.after(0, self.enable_begin_button)

    def enable_begin_button(self):
        """Enable the begin button after update check is complete."""
        if self.get_started_button:
            self.get_started_button.config(
                text="Begin Update Process", state=tk.NORMAL, cursor="hand2"
            )

    def show_update_notification(self, latest_version):
        """Show a popup notification about the available update."""
        message = f"A new version ({latest_version}) of the application is available.\n\nYou are currently using version {self.current_version}."
        messagebox.showinfo("Update Available", message)

    def go_to_next_page(self):
        """Navigate to the login page."""
        show_version_selection_page(user_role="user")


# Function to start the home page
def show_home_page():
    HomePage()
