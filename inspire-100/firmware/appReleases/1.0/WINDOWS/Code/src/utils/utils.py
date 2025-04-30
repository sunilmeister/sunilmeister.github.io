import os
import serial
import ctypes
import time
import serial.tools.list_ports
import subprocess
import platform


def is_admin():
    try:
        return os.getuid() == 0
    except AttributeError:
        return ctypes.windll.shell32.IsUserAnAdmin() != 0


def find_port():
    """Find the connected board from a whitelist of common VID/PID combinations."""
    ports = serial.tools.list_ports.comports()

    # Whitelist of common VID/PID combinations focusing on Mega 2560 and NodeMCU ESP8266
    vid_pid_whitelist = [
        # CH340 chips (common in clones)
        (0x1A86, 0x7523),  # CH340 (used in Mega clones & NodeMCU)
        (0x1A86, 0x5523),  # CH341
        # Arduino Mega 2560 official and clones
        (0x2341, 0x0010),  # Arduino Mega 2560
        (0x2341, 0x0042),  # Arduino Mega 2560 R3
        (0x2341, 0x0210),  # Arduino Mega 2560 (another variant)
        (0x2A03, 0x0010),  # Arduino Mega 2560 (genuine Arduino)
        (0x2A03, 0x0042),  # Arduino Mega 2560 R3 (genuine Arduino)
        # ESP8266 NodeMCU and variants
        (0x10C4, 0xEA60),  # Silicon Labs CP210x (ESP8266/NodeMCU)
        (0x1A86, 0x7523),  # CH340G (NodeMCU)
        (0x0403, 0x6001),  # FTDI (some NodeMCU variants)
        (0x10C4, 0xEA60),  # CP2102 (some NodeMCU variants)
        # Other common Arduino boards (for completeness)
        (0x2341, 0x0043),  # Arduino Uno R3
        (0x2341, 0x0001),  # Arduino Uno
        (0x2341, 0x0036),  # Arduino Leonardo
        (0x2341, 0x8036),  # Arduino Leonardo (boot)
        # Other ESP8266/ESP32 variants
        (0x10C4, 0xEA63),  # Silicon Labs CP210x (ESP32)
        (0x1A86, 0x55D4),  # CH9102F (ESP32/ESP8266)
        (0x303A, 0x1001),  # Espressif ESP32-S2
        (0x303A, 0x0002),  # Espressif ESP32-S3
    ]

    detected_port = None
    detected_board_info = None

    for port in ports:
        # Skip ports with no VID/PID (likely not USB devices)
        if port.vid is None or port.pid is None:
            continue

        for vid, pid in vid_pid_whitelist:
            if port.vid == vid and port.pid == pid:
                detected_port = port.device if os.name == "posix" else port.name
                detected_board_info = f"VID:0x{port.vid:04X}, PID:0x{port.pid:04X}"
                # Don't break here to find the most specific match possible

        # If we found a match, break the outer loop
        if detected_port:
            break

    if not detected_port:
        print("No compatible board detected.")
        return None

    # Try to identify board type
    board_type = verify_board_type(detected_port)

    if board_type:
        return detected_port
    else:
        print(f"Assuming Mega2560 clone at {detected_port}")
        return detected_port


def verify_board_type(port_name):
    """Check if the connected board is a NodeMCU by sending a command, else assume it's Mega."""
    try:
        with serial.Serial(port_name, 115200, timeout=2) as ser:
            time.sleep(2)  # Allow board to initialize
            ser.write(b"\r\n")  # Send a newline
            time.sleep(1)  # Wait for response
            response = ser.read(64).decode(errors="ignore").strip()

            if "OK" in response or response == "":
                return "NodeMCU"
            else:
                return "Mega2560"

    except Exception as e:
        print(f"Could not verify board type: {e}")

    return "Mega2560"


def get_arduino_cli_command():
    """
    Check if arduino-cli is installed, install it if not found, and also install required cores.

    Returns:
        list: Command list to invoke arduino-cli.
    """
    system = platform.system()
    arduino_cli_path = None

    # Check if arduino-cli is in PATH
    try:
        if system == "Windows":
            result = subprocess.run(
                ["where", "arduino-cli"], capture_output=True, text=True, check=True
            )
            arduino_cli_path = "arduino-cli"
        else:  # macOS or Linux
            result = subprocess.run(
                ["which", "arduino-cli"], capture_output=True, text=True, check=True
            )
            arduino_cli_path = "arduino-cli"
    except subprocess.SubprocessError:
        # If arduino-cli is not in PATH, look for it in common locations
        common_locations = []

        if system == "Windows":
            common_locations = [
                r"C:\Program Files\Arduino CLI\arduino-cli.exe",
                r"C:\Program Files (x86)\Arduino CLI\arduino-cli.exe",
                os.path.expanduser(r"~\AppData\Local\Arduino15\arduino-cli.exe"),
            ]
        elif system == "Darwin":  # macOS
            common_locations = [
                "/usr/local/bin/arduino-cli",
                "/usr/bin/arduino-cli",
                os.path.expanduser("~/Library/Arduino15/arduino-cli"),
            ]
        else:  # Linux and others
            common_locations = [
                "/usr/local/bin/arduino-cli",
                "/usr/bin/arduino-cli",
                os.path.expanduser("~/.arduino15/arduino-cli"),
            ]

        for location in common_locations:
            if os.path.exists(location):
                arduino_cli_path = location
                break

    # If arduino-cli is not found, install it
    if not arduino_cli_path:
        print("Arduino CLI not found. Installing...")

        if system == "Windows":
            # Install Chocolatey if not already installed
            try:
                subprocess.run(["choco", "--version"], capture_output=True, check=True)
                print("Chocolatey is already installed.")
            except (subprocess.SubprocessError, FileNotFoundError):
                print("Installing Chocolatey...")
                powershell_command = "[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
                subprocess.run(
                    ["powershell", "-Command", powershell_command], check=True
                )

            # Install arduino-cli via Chocolatey
            subprocess.run(["choco", "install", "arduino-cli", "-y"], check=True)
            arduino_cli_path = "arduino-cli"  # Now it should be in PATH

        elif system == "Darwin":  # macOS
            # Install using Homebrew
            try:
                subprocess.run(["brew", "--version"], capture_output=True, check=True)
                print("Homebrew is already installed.")
            except (subprocess.SubprocessError, FileNotFoundError):
                print("Installing Homebrew...")
                brew_install_cmd = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
                subprocess.run(brew_install_cmd, shell=True, check=True)

            subprocess.run(["brew", "install", "arduino-cli"], check=True)
            arduino_cli_path = "arduino-cli"

        else:  # Linux
            # For Linux, use the official install script
            curl_cmd = "curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh"
            subprocess.run(curl_cmd, shell=True, check=True)
            arduino_cli_path = os.path.expanduser("~/.arduino15/arduino-cli")

    # Ensure arduino-cli path is valid
    if not arduino_cli_path:
        raise RuntimeError("Failed to install or locate arduino-cli")

    # Initialize arduino-cli config
    subprocess.run(["arduino-cli", "config", "init", "--overwrite"], check=True)

    # Install required cores
    print("Installing required Arduino cores...")

    # Install ESP8266 core
    try:
        subprocess.run(
            [
                "arduino-cli",
                "core",
                "install",
                "esp8266:esp8266",
                "--additional-urls",
                "http://arduino.esp8266.com/stable/package_esp8266com_index.json",
            ],
            check=True,
        )
        print("ESP8266 core installed successfully.")
    except subprocess.SubprocessError:
        print("Warning: Failed to install ESP8266 core.")

    # Install Arduino AVR core
    try:
        subprocess.run(["arduino-cli", "core", "install", "arduino:avr"], check=True)
        print("Arduino AVR core installed successfully.")
    except subprocess.SubprocessError:
        print("Warning: Failed to install Arduino AVR core.")

    # Return the command list to invoke arduino-cli
    if isinstance(arduino_cli_path, list):
        return arduino_cli_path
    else:
        return [arduino_cli_path]


def get_esptool_command():
    """
    Get the appropriate esptool command.

    Returns:
        list: Command list to invoke esptool, or None if not found.
    """
    # Try direct esptool.py command
    try:
        subprocess.run(
            ["esptool.py", "--version"], capture_output=True, text=True, check=True
        )
        return ["esptool.py"]
    except (subprocess.SubprocessError, FileNotFoundError):
        pass

    # Try as Python module
    try:
        subprocess.run(
            ["python", "-m", "esptool", "--version"],
            capture_output=True,
            text=True,
            check=True,
        )
        return ["python", "-m", "esptool"]
    except (subprocess.SubprocessError, FileNotFoundError):
        pass

    # Try python3 explicitly (for Unix systems)
    try:
        subprocess.run(
            ["python3", "-m", "esptool", "--version"],
            capture_output=True,
            text=True,
            check=True,
        )
        return ["python3", "-m", "esptool"]
    except (subprocess.SubprocessError, FileNotFoundError):
        print("esptool not found. Please install it with: pip install esptool")
        return None
