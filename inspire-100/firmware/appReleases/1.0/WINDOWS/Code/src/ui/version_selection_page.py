import tkinter as tk
from tkinter import ttk
import json
import urllib.request
import urllib.error
import tkinter.messagebox as messagebox
import webbrowser

from src.ui.utils import load_and_resize_image
from src.ui.download_screen import download_screen
from src.ui.ui import version_var, show_retry_ui
from src.ui.erasing_pages import show_erase_page
from src.config.config import root
from src.config.color import BACKGROUND_COLOR, TEXT_COLOR, ACCENT_COLOR, SECONDARY_COLOR
from src.uid_installation.download_screen import show_uid_download_screen

# Update this to the raw JSON URL
JSON_URL = "https://raw.githubusercontent.com/sunilmeister/sunilmeister.github.io/refs/heads/main/inspire-100/firmware/fwReleases/fwReleases.json"


def select_version():
    selected_version = version_var.get()
    if selected_version != "Select Version":
        print("Selected version:", selected_version)
        return selected_version
    else:
        print("Please select a version.")
        return False


def fetch_versions(version_dropdown, user_role="user"):
    """Fetch firmware versions from GitHub and update the dropdown menu dynamically."""

    try:
        # Fetch JSON data from GitHub
        with urllib.request.urlopen(JSON_URL, timeout=5) as response:
            data = json.loads(response.read().decode())

        # Extract firmware versions from all board versions
        versions = []
        for board in data:
            for fw in board.get("firmwareVersions", []):
                versions.append(fw["release"])

        # Ensure unique and sorted versions
        versions = sorted(set(versions), reverse=True)

        if not versions:
            raise ValueError("No versions found in fwReleases.json")

        # Update dropdown menu dynamically
        menu = version_dropdown["menu"]
        menu.delete(0, "end")  # Clear existing options

        if user_role == "admin":
            # Admin can see all versions
            version_var.set(versions[0])  # Set latest version as default
            for version in versions:
                menu.add_command(
                    label=version, command=lambda v=version: version_var.set(v)
                )
        else:
            # User can only see and select the latest version
            version_var.set(versions[0])  # Set latest version
            menu.add_command(
                label=versions[0], command=lambda v=versions[0]: version_var.set(v)
            )
            # Disable the dropdown for users
            version_dropdown.configure(state="disabled")

    except (urllib.error.URLError, ValueError, json.JSONDecodeError) as e:
        print(f"Error fetching versions: {e}")
        show_retry_ui(version_dropdown=version_dropdown)


def install_clicked(board, user_role="user"):
    # Version select
    selected_version = select_version()
    if selected_version == False:
        return print("no version is selected")

    # Destroy all widgets
    for widget in root.winfo_children():
        widget.destroy()

    download_screen(board, selected_version, user_role)


def go_to_login_page():
    """Function to import login page lazily and navigate to it"""
    from src.ui.login_page import show_login_page

    show_login_page()


def install_uid_clicked(user_role="user"):
    """Handle the Install UID button click."""
    # Get the selected version
    selected_version = select_version()
    if not selected_version:
        messagebox.showerror("Error", "Please select a version first.")
        return

    # Show the UID download screen
    show_uid_download_screen(selected_version, user_role)


def show_systems_database():
    """Open the systems database URL in the default browser."""
    try:
        webbrowser.open("http://3.111.22.212:5000/view-installations")
    except Exception as e:
        messagebox.showerror("Error", f"Failed to open browser: {str(e)}")


def show_version_selection_page(user_role="user"):
    """
    Display version selection page with role-based modifications.

    Args:
        user_role (str): Role of the logged-in user (default is 'user')
    """
    # Clear any existing widgets
    for widget in root.winfo_children():
        widget.destroy()

    # Add a login button at the top right only if not admin
    top_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
    top_frame.pack(fill="x", padx=10, pady=5)

    # Only show login button if user is not already an admin
    if user_role != "admin":
        # Push login button to the right
        spacer = tk.Label(top_frame, bg=BACKGROUND_COLOR)
        spacer.pack(side=tk.LEFT, expand=True, fill="x")

        login_button = tk.Button(
            top_frame,
            text="Admin Login",
            command=go_to_login_page,
            bg=ACCENT_COLOR,
            fg="white",
            font=("Helvetica", 10),
            relief=tk.FLAT,
            padx=10,
            pady=5,
            cursor="hand2",
        )
        login_button.pack(side=tk.RIGHT)
    else:
        # Admin info label and logout button in a frame
        admin_frame = tk.Frame(top_frame, bg=BACKGROUND_COLOR)
        admin_frame.pack(side=tk.RIGHT)

        admin_info = tk.Label(
            admin_frame,
            text="Logged in as Admin",
            bg=BACKGROUND_COLOR,
            fg="green",
            font=("Helvetica", 10, "italic"),
        )
        admin_info.pack(side=tk.LEFT, padx=(0, 10))

        logout_button = tk.Button(
            admin_frame,
            text="Logout",
            command=lambda: show_version_selection_page("user"),
            bg=SECONDARY_COLOR,
            fg=TEXT_COLOR,
            font=("Helvetica", 10),
            relief=tk.FLAT,
            padx=8,
            pady=2,
            cursor="hand2",
        )
        logout_button.pack(side=tk.LEFT)

    # Load the logo
    photo = load_and_resize_image()

    # Main frame for better organization
    main_frame = tk.Frame(root, bg=BACKGROUND_COLOR)
    main_frame.pack(fill="both", expand=True, padx=20, pady=20)

    # Add the image at the top
    image_label = tk.Label(main_frame, image=photo, bg=BACKGROUND_COLOR)
    image_label.image = photo
    image_label.pack(pady=(0, 20))

    # Add other widgets below the image with improved styling
    label = tk.Label(
        main_frame,
        text="Select the version for the app:",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 14),
    )
    label.pack(pady=(0, 15))

    # Dropdown menu for selecting app version
    version_var.set("Select Version")  # Default option
    version_dropdown = ttk.OptionMenu(main_frame, version_var, *([version_var.get()]))
    version_dropdown.config(width=20)
    version_dropdown.pack(pady=(0, 20))

    # Separator for better UI
    separator = ttk.Separator(main_frame, orient="horizontal")
    separator.pack(fill="x", pady=10)

    # Admin-specific options
    if user_role == "admin":
        # Admin tools section with proper spacing and organization
        admin_section = tk.Frame(main_frame, bg=BACKGROUND_COLOR)
        admin_section.pack(pady=(0, 30), fill="x")

        # Admin tools title
        admin_title = tk.Label(
            admin_section,
            text="Admin Tools",
            bg=BACKGROUND_COLOR,
            fg=TEXT_COLOR,
            font=("Helvetica", 12, "bold"),
        )
        admin_title.pack(pady=(0, 15))

        # Create organized button layout using grid
        button_container = tk.Frame(admin_section, bg=BACKGROUND_COLOR)
        button_container.pack()

        # Configure grid weights for equal spacing
        button_container.grid_columnconfigure(0, weight=1)
        button_container.grid_columnconfigure(1, weight=1)
        button_container.grid_columnconfigure(2, weight=1)

        # First row - Main admin functions
        erase_button = tk.Button(
            button_container,
            text="Erase EEPROM\n(Master Port)",
            bg=SECONDARY_COLOR,
            fg=TEXT_COLOR,
            font=("Helvetica", 10),
            relief=tk.FLAT,
            padx=15,
            pady=10,
            cursor="hand2",
            width=15,
            height=2,
            command=lambda: show_erase_page(
                board_type="Master", erase_type="ROM", user_role=user_role
            ),
        )
        erase_button.grid(row=0, column=0, padx=10, pady=5, sticky="ew")

        uid_button = tk.Button(
            button_container,
            text="Install UID",
            bg=SECONDARY_COLOR,
            fg=TEXT_COLOR,
            font=("Helvetica", 10),
            relief=tk.FLAT,
            padx=15,
            pady=10,
            cursor="hand2",
            width=15,
            height=2,
            command=lambda: install_uid_clicked(user_role),
        )
        uid_button.grid(row=0, column=1, padx=10, pady=5, sticky="ew")

        database_button = tk.Button(
            button_container,
            text="View Systems\nDatabase",
            bg=SECONDARY_COLOR,
            fg=TEXT_COLOR,
            font=("Helvetica", 10),
            relief=tk.FLAT,
            padx=15,
            pady=10,
            cursor="hand2",
            width=15,
            height=2,
            command=show_systems_database,
        )
        database_button.grid(row=0, column=2, padx=10, pady=5, sticky="ew")

    # Main action buttons section
    action_section = tk.Frame(main_frame, bg=BACKGROUND_COLOR)
    action_section.pack(pady=20)

    # Main action buttons title
    action_title = tk.Label(
        action_section,
        text="Firmware Actions",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 12, "bold"),
    )
    action_title.pack(pady=(0, 15))

    # Button frame for main actions
    button_frame = tk.Frame(action_section, bg=BACKGROUND_COLOR)
    button_frame.pack()

    # Install button - primary action
    install_button = tk.Button(
        button_frame,
        text="Install Selected Firmware",
        command=lambda: install_clicked("Master", user_role),
        bg=ACCENT_COLOR,
        fg="white",
        font=("Helvetica", 12, "bold"),
        relief=tk.FLAT,
        padx=30,
        pady=12,
        cursor="hand2",
        activebackground="#0DD142",
        activeforeground="white",
        width=20,
    )
    install_button.pack(side=tk.LEFT, padx=(0, 15))

    # Exit button - secondary action
    exit_button = tk.Button(
        button_frame,
        text="Exit Application",
        command=root.quit,
        bg=SECONDARY_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 12),
        relief=tk.FLAT,
        padx=30,
        pady=12,
        cursor="hand2",
        width=15,
    )
    exit_button.pack(side=tk.LEFT)

    # Fetch versions with user role
    fetch_versions(version_dropdown, user_role)
