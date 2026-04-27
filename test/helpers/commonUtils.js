export default class CommonUtils {
  static generateAutomationText(description) {
    const now = new Date()

    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()

    let hours = now.getHours()
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'

    hours = hours % 12 || 12

    const formattedDate = `${day}/${month}/${year}`
    const formattedTime = `${hours}:${minutes}:${seconds}${ampm}`

    return `Automation ${formattedDate} ${formattedTime}\n${description}`
  }
}
