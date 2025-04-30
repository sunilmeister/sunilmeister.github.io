# Firmware_Update
The `Firmware_Update` project is designed to simplify the process of updating firmware for Arduino and NodeMCU devices. It provides a user-friendly interface and utility scripts to manage firmware updates efficiently.

## How to Run
To start the application, run the following command:  
```sh
python main.py
```

## Prerequisites
Before running the application, ensure the following:
- Python 3.7 or higher is installed.
- Required Python dependencies are installed. You can install them using:
  ```sh
  pip install -r requirements.txt
  ```


## Project Structure

```
Firmware_Update/
│── main.py                # Main entry point of the application
│── requirements.txt       # Python dependencies
│── src/
│   ├── arduino/           # Arduino-specific scripts
│   │   ├── __init__.py
│   │   ├── arduino.py     # Handles Arduino firmware updates
│   │   ├── bin/           # Arduino-specific binaries
│   ├── nodemcu/           # NodeMCU-specific scripts
│   │   ├── __init__.py
│   │   ├── nodemcu.py     # Handles NodeMCU firmware updates
│   │   ├── bin/           # NodeMCU-specific binaries
│   ├── ui/                # UI components
│   │   ├── __init__.py
│   │   ├── ui.py          # Main UI logic
│   │   ├── home_page.py   # Home page UI
│   │   ├── download_screen.py # Download screen UI
│   │   ├── run_installation.py # Installation UI
│   │   ├── version_selection_page.py # Version selection UI
│   │   ├── erasing_pages.py # Erasing-related UI
│   │   ├── utils.py       # UI utility functions
│   │   ├── assets/        # UI assets (images, etc.)
│   ├── config/            # Configuration files
│   │   ├── __init__.py
│   │   ├── config.py      # General configuration settings
│   │   ├── color.py       # Color scheme definitions
│   │   ├── data/          # Additional configuration data
│   ├── utils/             # Utility functions
│   │   ├── __init__.py
│   │   ├── utils.py       # General utility functions
│   │   ├── erasing.py     # Erasing-related utilities
│   ├── bin/               # Contains compiled binaries and empty firmware
│   │   ├── empty/
│   │   │   ├── empty.ino  # Empty firmware file for Arduino/NodeMCU
│   ├── backend/               # Backend API scripts
│   │   ├── api.py
```