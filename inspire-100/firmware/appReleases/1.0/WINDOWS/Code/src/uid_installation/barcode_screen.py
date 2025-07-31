import tkinter as tk
from tkinter import ttk, filedialog
import qrcode
from PIL import Image, ImageTk
import os
import barcode
from barcode.writer import ImageWriter
from io import BytesIO

from src.config.config import root
from src.config.color import BACKGROUND_COLOR, TEXT_COLOR, ACCENT_COLOR, SECONDARY_COLOR
from src.ui.utils import load_and_resize_image
from src.uid_installation.completion_screen import show_completion_screen


def generate_barcode(uid):
    """Generate a 1D barcode (Code128) for the given UID."""
    # Create an in-memory buffer for the barcode
    barcode_buffer = BytesIO()

    # Generate the barcode directly to the buffer
    code128 = barcode.get("code128", uid, writer=ImageWriter())
    code128.write(barcode_buffer)

    # Reset buffer position to the beginning
    barcode_buffer.seek(0)

    # Open the image from the buffer
    pil_image = Image.open(barcode_buffer)
    pil_image = pil_image.resize((400, 100), Image.LANCZOS)

    # Create Tkinter-compatible image
    tk_image = ImageTk.PhotoImage(pil_image)

    # Save a copy to disk for possible later use
    barcode_dir = os.path.join(os.path.expanduser("~"), "Inspire100", "barcodes")
    os.makedirs(barcode_dir, exist_ok=True)
    barcode_path = os.path.join(barcode_dir, f"{uid}.png")
    try:
        pil_image.save(barcode_path)
        print(f"[DEBUG] Barcode saved to: {barcode_path}")
    except Exception as e:
        print(f"[DEBUG] Could not save barcode to disk: {e}")

    return pil_image, tk_image


def save_barcode(pil_image, uid):
    """Save the barcode image to a file."""
    # Use the same user-writable directory as above for initial directory
    barcode_dir = os.path.join(os.path.expanduser("~"), "Inspire100", "barcodes")
    os.makedirs(barcode_dir, exist_ok=True)
    file_path = filedialog.asksaveasfilename(
        defaultextension=".png",
        initialdir=barcode_dir,
        initialfile=f"UID_{uid}.png",
        filetypes=[("PNG files", "*.png"), ("All files", "*.*")],
    )
    if file_path:
        pil_image.save(file_path)
        return True
    return False


def show_barcode_screen(uid, user_role):
    """Display the barcode generation screen."""
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
        text="UID Barcode",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 16, "bold"),
    )
    title_label.pack(pady=(0, 20))

    # UID display
    uid_label = tk.Label(
        main_frame,
        text=f"UID: {uid}",
        bg=BACKGROUND_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 12),
    )
    uid_label.pack(pady=(0, 20))

    # Generate barcode images
    pil_image, tk_image = generate_barcode(uid)

    # Display barcode
    qr_label = tk.Label(main_frame, image=tk_image, bg=BACKGROUND_COLOR)
    qr_label.image = tk_image  # Keep a reference
    qr_label.pack(pady=(0, 20))

    # Button frame
    button_frame = tk.Frame(main_frame, bg=BACKGROUND_COLOR)
    button_frame.pack(pady=20)

    # Save button
    save_button = tk.Button(
        button_frame,
        text="Save Barcode",
        command=lambda: save_barcode(pil_image, uid),
        bg=SECONDARY_COLOR,
        fg=TEXT_COLOR,
        font=("Helvetica", 12),
        relief=tk.FLAT,
        padx=20,
        pady=8,
        cursor="hand2",
    )
    save_button.pack(side=tk.LEFT, padx=10)

    # Continue button
    continue_button = tk.Button(
        button_frame,
        text="Continue",
        command=lambda: show_completion_screen(uid, user_role),
        bg=ACCENT_COLOR,
        fg="white",
        font=("Helvetica", 12),
        relief=tk.FLAT,
        padx=20,
        pady=8,
        cursor="hand2",
    )
    continue_button.pack(side=tk.LEFT, padx=10)
