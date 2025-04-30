import tkinter as tk
from tkinter import messagebox
import json
import os
import hashlib

from src.config.config import root
from src.config.color import BACKGROUND_COLOR, TEXT_COLOR, ACCENT_COLOR, SECONDARY_COLOR
from src.ui.utils import load_and_resize_image
from src.ui.version_selection_page import show_version_selection_page


class LoginPage:
    def __init__(self):
        """Initialize the login page."""
        self.root = root
        self.users_file = os.path.join(
            os.path.dirname(__file__), "..", "config", "data", "users.json"
        )
        self.create_login_page()

    def create_login_page(self):
        """Create and display the login page."""
        # Clear any existing widgets
        for widget in self.root.winfo_children():
            widget.destroy()

        # Load the logo
        photo = load_and_resize_image()

        # Main frame
        main_frame = tk.Frame(self.root, bg=BACKGROUND_COLOR)
        main_frame.pack(fill="both", expand=True, padx=20, pady=20)

        # Logo
        logo_label = tk.Label(main_frame, image=photo, bg=BACKGROUND_COLOR)
        logo_label.image = photo
        logo_label.pack(pady=(0, 30))

        # Title
        title_label = tk.Label(
            main_frame,
            text="Login",
            bg=BACKGROUND_COLOR,
            fg=TEXT_COLOR,
            font=("Helvetica", 18, "bold"),
        )
        title_label.pack(pady=(0, 20))

        # Email Entry
        email_frame = tk.Frame(main_frame, bg=BACKGROUND_COLOR)
        email_frame.pack(pady=10)

        email_label = tk.Label(
            email_frame,
            text="Email:",
            bg=BACKGROUND_COLOR,
            fg=TEXT_COLOR,
            font=("Helvetica", 12),
        )
        email_label.pack(side=tk.LEFT, padx=(0, 10))

        self.email_entry = tk.Entry(email_frame, font=("Helvetica", 12), width=30)
        self.email_entry.pack(side=tk.LEFT)

        # Password Entry
        password_frame = tk.Frame(main_frame, bg=BACKGROUND_COLOR)
        password_frame.pack(pady=10)

        password_label = tk.Label(
            password_frame,
            text="Password:",
            bg=BACKGROUND_COLOR,
            fg=TEXT_COLOR,
            font=("Helvetica", 12),
        )
        password_label.pack(side=tk.LEFT, padx=(0, 10))

        self.password_entry = tk.Entry(
            password_frame, show="*", font=("Helvetica", 12), width=30
        )
        self.password_entry.pack(side=tk.LEFT)

        # Login Button
        login_button = tk.Button(
            main_frame,
            text="Login",
            command=self.validate_login,
            bg=ACCENT_COLOR,
            fg="white",
            font=("Helvetica", 14, "bold"),
            relief=tk.FLAT,
            padx=30,
            pady=10,
            cursor="hand2",
        )
        login_button.pack(pady=20)

    def validate_login(self):
        """Validate user credentials."""
        email = self.email_entry.get().strip()
        password = self.password_entry.get()

        # Hash the password
        hashed_password = hashlib.sha256(password.encode()).hexdigest()

        # Check credentials
        try:
            with open(self.users_file, "r") as f:
                users = json.load(f)
        except FileNotFoundError:
            messagebox.showerror("Error", "Users database not found.")
            return
        except json.JSONDecodeError:
            messagebox.showerror("Error", "Invalid users database.")
            return

        # Find user
        for user in users:
            if user["email"] == email and user["password"] == hashed_password:
                # Successful login
                show_message(f"Login successful! Welcome {user['name']}!")
                # Pass user role to version selection
                show_version_selection_page(user["role"])
                return

        # Login failed
        show_message("Login Failed!")


def show_message(message):
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


# Function to show login page
def show_login_page():
    LoginPage()
