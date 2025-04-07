import { WebhookClient } from 'discord.js'
import handleServerError from './handleServerError'

export const WEBHOOK_COLOR = 15158332

/**
 * Post a webhook message to Discord
 * @param {*} url Webhook URL
 * @param {*} embeds Array of embeds to send
 * @param {*} content Content to send
 * @returns {boolean|string} Message ID if successful, false if failed
 */
export const postWebhook = async (url, content, embeds) => {
  try {
    const webhookClient = new WebhookClient({ url })

    const result = await webhookClient.send({
      content,
      username: 'TECHMANIA',
      avatarURL: 'https://avatars.githubusercontent.com/u/77661148?s=200&v=4',
      embeds,
    })

    return result.id
  } catch (error) {
    handleServerError(error)
    return false
  }
}

/**
 * Edit a webhook message in Discord
 * @param {*} url Webhook URL
 * @param {*} id Message ID to edit
 * @param {*} content New content to send
 * @param {*} embeds Array of embeds to send
 * @returns {boolean|string} Message ID if successful, false if failed
 */
export const editWebhook = async (url, id, content, embeds) => {
  try {
    const webhookClient = new WebhookClient({ url })

    const result = await webhookClient.editMessage(id, {
      content,
      username: 'TECHMANIA',
      avatarURL: 'https://avatars.githubusercontent.com/u/77661148?s=200&v=4',
      embeds,
    })

    return result.id
  } catch (error) {
    handleServerError(error)
    return false
  }
}

/**
 * Delete a webhook message in Discord
 * @param {*} url Webhook URL
 * @param {*} id Message ID to delete
 * @returns {boolean} true if successful, false if failed
 */
export const deleteWebhook = async (url, id) => {
  try {
    const webhookClient = new WebhookClient({ url })

    await webhookClient.deleteMessage(id)

    return true
  } catch (error) {
    handleServerError(error)
    return false
  }
}
