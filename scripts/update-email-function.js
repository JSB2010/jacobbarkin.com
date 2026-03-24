// Script to update the email notification function in Appwrite
const { Client, Functions } = require('node-appwrite');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const execFile = promisify(require('child_process').execFile);

// Appwrite configuration - load from environment variables
require('dotenv').config({ path: '.env.local' });

const config = {
  endpoint: process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
  projectId: process.env.APPWRITE_PROJECT_ID || '',
  apiKey: process.env.APPWRITE_API_KEY || '',
  functionId: process.env.APPWRITE_FUNCTION_ID || 'contact-email-notification',
  functionName: 'Contact Form Email Notification',
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_PASSWORD || ''
};

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const functions = new Functions(client);

// Function to create a zip file of the email notification function
async function createFunctionZip() {
  console.log('Creating function zip file...');

  const sourceDir = path.join(__dirname, '../functions/email-notification-updated');
  const outputFile = path.join(__dirname, '../functions/email-notification-updated.zip');

  fs.rmSync(outputFile, { force: true });

  await execFile('zip', ['-r', '-q', outputFile, '.'], {
    cwd: sourceDir
  });

  console.log(`Function zip created: ${fs.statSync(outputFile).size} total bytes`);
  return outputFile;
}

// Function to update the email notification function
async function updateFunction() {
  console.log('Updating email notification function...');

  try {
    // Create function zip file
    const zipFile = await createFunctionZip();

    // Check if function exists
    let functionExists = false;
    try {
      await functions.get(config.functionId);
      functionExists = true;
      console.log(`Function ${config.functionId} already exists.`);
    } catch (error) {
      if (error.code === 404) {
        console.log(`Function ${config.functionId} does not exist. Creating...`);
      } else {
        throw error;
      }
    }

    // Use a valid runtime from the list of available runtimes
    const selectedRuntime = 'node-18.0'; // This is one of the valid runtimes from the error message
    console.log(`Selected runtime: ${selectedRuntime}`);

    if (!functionExists) {
      // Create function if it doesn't exist
      console.log(`Creating function ${config.functionId}...`);
      await functions.create(
        config.functionId,
        config.functionName,
        ['any'], // Execute permissions
        selectedRuntime // Use the selected runtime
      );
      console.log(`Function ${config.functionId} created.`);
    }

    // Update function settings
    console.log(`Updating function ${config.functionId} settings...`);
    await functions.update(
      config.functionId,
      config.functionName,
      ['any'], // Execute permissions
      15 // Timeout in seconds
    );
    console.log(`Function ${config.functionId} settings updated.`);

    // Set function variables
    console.log('Setting function variables...');

    // Helper function to set a variable (create or update)
    async function setFunctionVariable(key, value) {
      try {
        // Try to create the variable
        await functions.createVariable(
          config.functionId,
          key,
          value
        );
        console.log(`${key} variable created.`);
      } catch (error) {
        if (error.code === 409) {
          // Variable already exists, update it
          try {
            await functions.updateVariable(
              config.functionId,
              key,
              value
            );
            console.log(`${key} variable updated.`);
          } catch (updateError) {
            console.error(`Error updating ${key} variable:`, updateError);
          }
        } else {
          console.error(`Error creating ${key} variable:`, error);
        }
      }
    }

    // Set the variables
    await setFunctionVariable('EMAIL_USER', config.emailUser);
    await setFunctionVariable('EMAIL_PASSWORD', config.emailPassword);

    // Deploy function
    console.log(`Deploying function ${config.functionId}...`);
    try {
      const zipData = fs.readFileSync(zipFile);
      await functions.createDeployment(
        config.functionId,
        'latest',
        zipData,
        true // Activate deployment
      );
      console.log(`Function ${config.functionId} deployed.`);
    } catch (error) {
      console.error('Error deploying function:', error);
      throw error;
    }

    // Set up database event trigger
    console.log('Setting up database event trigger...');
    try {
      // First, check if the event already exists
      const events = await functions.listEvents(config.functionId);
      const eventName = `databases.contact-form-db.collections.contact-submissions.documents.create`;
      const eventExists = events.events.some(event => event.includes(eventName));

      if (eventExists) {
        console.log('Database event trigger already exists.');
      } else {
        try {
          await functions.createEvent(
            config.functionId,
            eventName
          );
          console.log('Database event trigger created.');
        } catch (eventError) {
          console.error('Error creating event trigger:', eventError);
          console.log('You may need to manually set up the event trigger in the Appwrite Console.');
        }
      }
    } catch (error) {
      console.error('Error checking event triggers:', error);
      console.log('You may need to manually set up the event trigger in the Appwrite Console.');
    }

    // Clean up
    try {
      fs.unlinkSync(zipFile);
      console.log('Cleaned up temporary files.');
    } catch (error) {
      console.error('Error cleaning up temporary files:', error);
    }

    console.log('Function update completed successfully!');
    return true;
  } catch (error) {
    console.error('Error updating function:', error);
    throw error;
  }
}

// Run the update
updateFunction()
  .then(success => {
    if (success) {
      console.log('==============================================');
      console.log('Email notification function updated successfully!');
      console.log('==============================================');
      console.log('Your contact form is now configured to:');
      console.log('1. Store submissions in Appwrite database');
      console.log('2. Send email notifications to your Gmail account');
      console.log('==============================================');
      process.exit(0);
    } else {
      console.error('Function update failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
