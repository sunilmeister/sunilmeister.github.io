const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("================================");
console.log("TekMedika Backend Build Script");
console.log("================================");

function executeCommand(command, description) {
  console.log(`\n${description}...`);
  try {
    execSync(command, { stdio: "inherit" });
    return true;
  } catch (error) {
    console.error(`ERROR: ${description} failed`);
    console.error(error.message);
    return false;
  }
}

function copyFileSync(source, target) {
  try {
    fs.copyFileSync(source, target);
    console.log(`Copied: ${source} -> ${target}`);
    return true;
  } catch (error) {
    console.error(`Failed to copy ${source}: ${error.message}`);
    return false;
  }
}

function copyDirectorySync(source, target) {
  try {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }

    const items = fs.readdirSync(source);
    for (const item of items) {
      const sourcePath = path.join(source, item);
      const targetPath = path.join(target, item);

      if (fs.statSync(sourcePath).isDirectory()) {
        copyDirectorySync(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
    console.log(`Copied directory: ${source} -> ${target}`);
    return true;
  } catch (error) {
    console.error(`Failed to copy directory ${source}: ${error.message}`);
    return false;
  }
}

// Step 1: Clean previous builds
console.log("\nStep 1: Cleaning previous builds...");
if (fs.existsSync("build")) {
  fs.rmSync("build", { recursive: true, force: true });
  console.log("Removed existing build directory");
}

// Step 2: Check environment file
console.log("\nStep 2: Checking environment configuration...");
if (!fs.existsSync(".env")) {
  if (fs.existsSync(".env.example")) {
    fs.copyFileSync(".env.example", ".env");
    console.log("Copied .env.example to .env");
    console.log(
      "WARNING: Please update .env file with your actual configuration"
    );
  } else {
    console.log(
      "WARNING: No .env file found. Please create one with your configuration."
    );
  }
} else {
  console.log(".env file exists");
}

// Step 3: Create build directory
console.log("\nStep 3: Creating build directory...");
if (!fs.existsSync("build")) {
  fs.mkdirSync("build");
  console.log("Build directory created");
}

// Step 4: Copy production files
console.log("\nStep 4: Copying production files...");
const filesToCopy = ["app.js", "package.json", ".env"];

let copySuccess = true;
for (const file of filesToCopy) {
  if (fs.existsSync(file)) {
    if (!copyFileSync(file, path.join("build", file))) {
      copySuccess = false;
    }
  } else {
    console.warn(`Warning: ${file} not found, skipping...`);
  }
}

// Copy views directory if it exists
if (fs.existsSync("views")) {
  if (!copyDirectorySync("views", "build/views")) {
    copySuccess = false;
  }
}

// Step 5: Create production package.json
console.log("\nStep 5: Creating production package.json...");
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

  // Remove devDependencies for production
  delete packageJson.devDependencies;

  // Add production-specific scripts
  packageJson.scripts = {
    start: "node app.js",
    "install-prod": "npm install --production"
  };

  fs.writeFileSync("build/package.json", JSON.stringify(packageJson, null, 2));
  console.log("Production package.json created");
} catch (error) {
  console.error("Failed to create production package.json:", error.message);
  copySuccess = false;
}

// Step 6: Create deployment instructions
console.log("\nStep 6: Creating deployment instructions...");
const deployInstructions = `# TekMedika Backend Deployment

## Production Deployment

1. Copy the contents of this build directory to your production server
2. Install production dependencies:
   \`\`\`bash
   npm install --production
   \`\`\`
3. Update the .env file with your production configuration
4. Start the server:
   \`\`\`bash
   npm start
   \`\`\`

## Environment Variables Required

- DB_HOST: Database host
- DB_USER: Database username  
- DB_PASSWORD: Database password
- DB_NAME: Database name
- SECRET_KEY: Secret key for API authentication
- PORT: Port number (optional, defaults to 5000)

## Health Check

The server should be accessible at:
- Main endpoint: http://localhost:5000/
- View installations: http://localhost:5000/view-installations
- API endpoint: http://localhost:5000/api/firmware-installation

Generated on: ${new Date().toISOString()}
`;

try {
  fs.writeFileSync("build/DEPLOYMENT.md", deployInstructions);
  console.log("Deployment instructions created");
} catch (error) {
  console.error("Failed to create deployment instructions:", error.message);
}

// Final summary
if (copySuccess) {
  console.log("\n================================");
  console.log("Build completed successfully!");
  console.log("================================");
  console.log("\nProduction files are in the 'build' directory");
  console.log("\nTo deploy:");
  console.log("1. cd build");
  console.log("2. npm install --production");
  console.log("3. Update .env with production settings");
  console.log("4. npm start");
} else {
  console.error("\n================================");
  console.error("Build failed!");
  console.error("================================");
  console.error("Please check the errors above and try again.");
  process.exit(1);
}
