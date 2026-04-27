import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

  static async getTextFromFile(fileName) {
    try {
      const filePath = path.join(__dirname, '..', 'testdata', `${fileName}.txt`)
      const content = await fs.readFile(filePath, 'utf-8')

      return content.trim()
    } catch (error) {
      throw new Error(`
        Unable to read testdata file: ${fileName}.txt
        Path: ${error.path || 'Not found'}
        Reason: ${error.message}
      `)
    }
  }
}
