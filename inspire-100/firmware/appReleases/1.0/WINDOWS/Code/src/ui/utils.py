import os
from PIL import Image, ImageTk
from src.config.config import root
from src.config.color import BACKGROUND_COLOR


def load_and_resize_image(width=400):
    """
    Load and resize the logo image with a specified width.

    Args:
        width (int, optional): Desired width of the image. Defaults to 400.

    Returns:
        ImageTk.PhotoImage: Resized image
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(script_dir, "assets", "logo.png")

    original_image = Image.open(image_path)

    # Calculate the new size while maintaining aspect ratio
    aspect_ratio = original_image.width / original_image.height
    desired_height = int(width / aspect_ratio)

    # Resize the image
    resized_image = original_image.resize((width, desired_height))
    return ImageTk.PhotoImage(resized_image)
