# Waiʻānapanapa State Park Cabin Availability Checker

This Google Apps Script project automatically checks for cabin availability at Waiʻānapanapa State Park in Maui, Hawaii. When new availability is detected within the next 60 days, it sends email notifications to a list of recipients.

## Usage

1. Create a new Google Apps Script project.

2. Copy the provided code into the script editor.

3. Add the Cheerio library to your project:

   - Click on "Resources" > "Libraries..."
   - Enter the following Script ID: `1ReeQ6WO8kKNxoaA_O0XEQ589cIrRvEBA9qcWpNqdOP17i47u6N9M5Xh0`
   - Click "Add" and select the latest version.

4. Set up the admin email:

   - Modify the `setAdminEmail()` function by replacing `'admin@example.com'` with your actual admin email address.
   - Run the `setAdminEmail()` function to save the admin email.

5. Set up email recipients:

   - Modify the `setRecipients()` function by replacing the example email addresses with your actual recipient email addresses.
   - Run the `setRecipients()` function to save the recipient list.

6. Set up the trigger:

   - Run the `setTrigger()` function to create an hourly trigger for the script.

7. Run the `checkCabinAvailability()` function once manually to initialize the `lastState`. This sets the initial state to check for subsequent changes when the automatic trigger runs.

8. The script will now run automatically every hour, checking for new availability and sending email notifications when changes are detected.
