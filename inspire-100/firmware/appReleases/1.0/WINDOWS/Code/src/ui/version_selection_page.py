import tkinter as tk
from tkinter import ttk
import json
import urllib.request
import urllib.error

from src.ui.utils import load_and_resize_image
from src.ui.download_screen import download_screen
from src.ui.ui import version_var, show_retry_ui
from src.ui.erasing_pages import show_erase_page
from src.config.config import root
from src.config.color import BACKGROUND_COLOR, TEXT_COLOR, ACCENT_COLOR, SECONDARY_COLOR

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


def fetch_versions(version_dropdown):
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
        version_var.set(versions[0])  # Set latest version as default
        menu = version_dropdown["menu"]
        menu.delete(0, "end")  # Clear existing options

        for version in versions:
            menu.add_command(
                label=version, command=lambda v=version: version_var.set(v)
            )

    except (urllib.error.URLError, ValueError, json.JSONDecodeError) as e:
        print(f"Error fetching versions: {e}")
        show_retry_ui(version_dropdown=version_dropdown)


def install_clicked(board):
    # Version select
    selected_version = select_version()
    if selected_version == False:
        return print("no version is selected")

    # Destroy all widgets
    for widget in root.winfo_children():
        widget.destroy()

    download_screen(board, selected_version)


def go_to_login_page():
    """Function to import login page lazily and navigate to it"""
    from src.ui.login_page import show_login_page

    show_login_page()


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
            text="Login",
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
        # Admin info label
        admin_info = tk.Label(
            top_frame,
            text="Logged in as Admin",
            bg=BACKGROUND_COLOR,
            fg="green",
            font=("Helvetica", 10, "italic"),
        )
        admin_info.pack(side=tk.RIGHT)

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

    # Button frame for better organization
    button_frame = tk.Frame(main_frame, bg=BACKGROUND_COLOR)
    button_frame.pack(pady=10)

    # Admin-specific options
    if user_role == "admin":
        admin_label = tk.Label(
            main_frame,
            text="Admin Mode: Erase Options",
            bg=BACKGROUND_COLOR,
            fg="green",
            font=("Helvetica", 12, "bold"),
        )
        admin_label.pack(pady=(0, 10))

        # Grid layout for better positioning
        erase_frame = tk.Frame(main_frame, bg=BACKGROUND_COLOR)
        erase_frame.pack(pady=(0, 20))

        # Reduce button width and font size
        buttons = [
            ("Erase ROM (Master Port)", "Arduino Mega", "ROM"),
            ("Erase ROM (Slave Port)", "NodeMCU", "ROM"),
        ]

        for i, (text, board, erase_type) in enumerate(buttons):
            button = tk.Button(
                erase_frame,
                text=text,
                bg=SECONDARY_COLOR,
                fg=TEXT_COLOR,
                font=("Helvetica", 10),
                relief=tk.FLAT,
                padx=10,
                pady=5,
                cursor="hand2",
                command=lambda b=board, e=erase_type: show_erase_page(
                    board_type=b, erase_type=e
                ),
            )
            button.grid(row=i // 2, column=i % 2, padx=10, pady=5, sticky="ew")

    # Install button
    install_button = tk.Button(
        button_frame,
        text="Install",
        command=lambda: install_clicked("Master"),
        bg=ACCENT_COLOR,
        fg="white",
        font=("Helvetica", 12, "bold"),
        relief=tk.FLAT,
        padx=20,
        pady=8,
        cursor="hand2",
        activebackground="#0DD142",
        activeforeground="white",
    )
    install_button.pack(side=tk.LEFT)

    # Fetch versions
    fetch_versions(version_dropdown)
