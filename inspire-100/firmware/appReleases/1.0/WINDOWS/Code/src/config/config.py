import tkinter as tk
from src.config.color import BACKGROUND_COLOR

# Global state variables
installation_complete = False
installation_success = False
upload_complete = False
upload_success = False

root = tk.Tk()
root.title("INSPIRE-100 Installer")
root.geometry("480x655")  # Slightly larger window for better spacing
root.configure(bg=BACKGROUND_COLOR)
root.resizable(True, True)  # Prevent window from resizing
