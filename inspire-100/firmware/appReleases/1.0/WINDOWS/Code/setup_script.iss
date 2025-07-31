[Setup]
AppName=Inspire-100 Firmware Utility
AppVersion=1.0
DefaultDirName={pf}\Inspire-100 Firmware Utility
DefaultGroupName=Inspire-100 Firmware Utility
OutputDir=Installer
OutputBaseFilename=Inspire-100_Firmware_Utility_Setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
SetupIconFile=src\ui\assets\icon.ico

[Files]
; Main Executable
Source: "dist\Inspire-100_Firmware_Utility_Setup.exe"; DestDir: "{app}"

; Configuration & Assets
Source: "src\config\*"; DestDir: "{app}\config"; Flags: recursesubdirs createallsubdirs
Source: "src\ui\assets\logo.png"; DestDir: "{app}\ui\assets"
Source: "src\bin\*"; DestDir: "{app}\bin"; Flags: recursesubdirs createallsubdirs
Source: "src\utils\*"; DestDir: "{app}\utils"; Flags: recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Inspire-100 Firmware Utility"; Filename: "{app}\Inspire-100_Firmware_Utility_Setup.exe"
Name: "{commondesktop}\Inspire-100 Firmware Utility"; Filename: "{app}\Inspire-100_Firmware_Utility_Setup.exe"

[Run]
Filename: "{app}\Inspire-100_Firmware_Utility_Setup.exe"; Description: "Launch Inspire-100 Firmware Utility"; Flags: nowait postinstall runascurrentuser
