// Constants

const APP_PROPERTIES = {
  ADMIN_EMAIL: 'adminEmail',
  EMAIL_RECIPIENTS: 'emailRecipients',
  PREVIOUS_STATE: 'previousState'
}

const DAYS_TO_CHECK = 60

const EMAIL_ADDRESSES = {
  ADMIN: 'admin@example.com', // TODO: Add your email here.
  RECIPIENTS: ['email1@example.com', 'email2@example.com'] // TODO: Add your email recipients here.
}

const PARK_NAME = 'Waiʻānapanapa State Park'

const RESERVATION_URL = 'https://camping.ehawaii.gov/camping/all,details,1684.html'

// Functions

function checkCabinAvailability() {
  try {
    const today = new Date()
    const hawaiiTime = Utilities.formatDate(today, 'HST', "yyyy-MM-dd'T'HH:mm:ss'Z'")
    const dateString = Utilities.formatDate(new Date(hawaiiTime), 'HST', 'yyyyMMdd')

    const url = `https://camping.ehawaii.gov/camping/all,sites,0,25,1,1684,CABIN,,,${dateString},${DAYS_TO_CHECK},,,1,1728616426006.html`

    const response = UrlFetchApp.fetch(url)
    const content = response.getContentText()

    const $ = Cheerio.load(content)

    const cabins = []
    const dates = []

    // Skip the first 6 columns which do not contain date information.
    $('table#sites_table thead th').each(function (i) {
      if (i >= 6) dates.push($(this).text().trim())
    })

    $('table#sites_table tbody tr').each(function () {
      const cabinId = $(this).find('td').eq(0).text().trim()

      // Skip the last row which contains pagination information.
      if (cabinId.startsWith('Records')) return

      const cabin = { availability: {}, id: cabinId }

      for (let i = 6; i < 6 + DAYS_TO_CHECK; i++) {
        cabin.availability[dates[i - 6]] = $(this).find('td').eq(i).text().trim()
      }

      cabins.push(cabin)
    })

    const changes = checkForChanges(cabins)

    if (changes.length > 0) sendEmailToRecipients(changes)

    // Store the current state for future comparisons.
    PropertiesService.getScriptProperties().setProperty(APP_PROPERTIES.PREVIOUS_STATE, JSON.stringify(cabins))
  } catch (error) {
    console.error('Error in checkCabinAvailability:', error)

    sendErrorNotification(error)
  }
}

function checkForChanges(currentState) {
  const previousStateString = PropertiesService.getScriptProperties().getProperty(APP_PROPERTIES.PREVIOUS_STATE)

  if (!previousStateString) return [] // First run – no changes to report.

  const previousState = JSON.parse(previousStateString)
  const changes = []

  currentState.forEach((cabin, index) => {
    const previousCabinState = previousState[index]

    Object.keys(cabin.availability).forEach(date => {
      if (cabin.availability[date] === 'Y' && previousCabinState.availability[date] !== 'Y') {
        changes.push({ cabinId: cabin.id, date: date })
      }
    })
  })

  return changes
}

function sendEmailToRecipients(changes) {
  const recipientsJson = PropertiesService.getScriptProperties().getProperty(APP_PROPERTIES.EMAIL_RECIPIENTS)
  const recipients = JSON.parse(recipientsJson)
  const subject = `${PARK_NAME} Cabin Availability Alert - ${new Date().toLocaleString('en-US', { timeZone: 'HST' })}`

  let body = `New availability detected for ${PARK_NAME} cabins:\n\n`

  changes.forEach(change => (body += `Cabin ${change.cabinId} is now available on ${change.date}.\n`))

  body += `\nTo make a reservation, visit: ${RESERVATION_URL}`

  recipients.forEach(recipient => MailApp.sendEmail(recipient, subject, body))
}

function sendErrorNotification(error) {
  const adminEmail = PropertiesService.getScriptProperties().getProperty(APP_PROPERTIES.ADMIN_EMAIL)
  const subject = `Cabin Checker Error - ${new Date().toLocaleString('en-US', { timeZone: 'HST' })}`

  MailApp.sendEmail(adminEmail, subject, `An error occurred: ${error.message}`)
}

function setAdminEmail() {
  PropertiesService.getScriptProperties().setProperty(APP_PROPERTIES.ADMIN_EMAIL, EMAIL_ADDRESSES.ADMIN)
}

function setRecipients() {
  PropertiesService.getScriptProperties().setProperty(
    APP_PROPERTIES.EMAIL_RECIPIENTS,
    JSON.stringify(EMAIL_ADDRESSES.RECIPIENTS)
  )
}

function setTrigger() {
  const triggers = ScriptApp.getProjectTriggers()

  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger))

  ScriptApp.newTrigger('checkCabinAvailability').timeBased().everyHours(1).create()
}
