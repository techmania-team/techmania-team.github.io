import type { EmbedBuilder } from 'discord.js'
import { WebhookClient } from 'discord.js'

export const WEBHOOK_COLOR = 15158332

/**
 * Post a webhook message to Discord
 * @param {string} url Webhook URL
 * @param {string} content Content to send
 * @param {[EmbedBuilder]} embeds Array of embeds to send
 * @returns {boolean|string} Message ID if successful, false if failed
 */
export const postWebhook = async (url: string, content: string, embeds: [EmbedBuilder]) => {
  try {
    const webhookClient = new WebhookClient({ url })

    const result = await webhookClient.send({
      content,
      username: 'TECHMANIA',
      avatarURL: 'https://avatars.githubusercontent.com/u/77661148?s=200&v=4',
      embeds,
    })

    return result.id
  } catch {
    return false
  }
}

/**
 * Edit a webhook message in Discord
 * @param {string} url Webhook URL
 * @param {string} id Message ID to edit
 * @param {string} content New content to send
 * @param {[EmbedBuilder]} embeds Array of embeds to send
 * @returns {boolean|string} Message ID if successful, false if failed
 */
export const editWebhook = async (
  url: string,
  id: string,
  content: string,
  embeds: [EmbedBuilder],
) => {
  try {
    const webhookClient = new WebhookClient({ url })

    const result = await webhookClient.editMessage(id, {
      content,
      embeds,
    })

    return result.id
  } catch {
    return false
  }
}

/**
 * Delete a webhook message in Discord
 * @param {string} url Webhook URL
 * @param {string} id Message ID to delete
 * @returns {boolean} true if successful, false if failed
 */
export const deleteWebhook = async (url: string, id: string) => {
  try {
    const webhookClient = new WebhookClient({ url })

    await webhookClient.deleteMessage(id)

    return true
  } catch {
    return false
  }
}
