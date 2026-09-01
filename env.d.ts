/**
 * Add types (that are not auto-magically added by Quasar CLI already)
 * for your custom variables to avoid TypeScript errors, like dynamic
 * process.env variables or definitions in dotenv files configured ONLY
 * for the /quasar.config file itself.
 *
 * https://quasar.dev/quasar-cli-vite/handling-import-meta-env#type-inference
 *
 * @example
 * interface ImportMetaEnv {
 *   readonly MY_VAR: string;
 *   readonly MY_OTHER_VAR: string;
 * }
 */
interface ImportMetaEnv {
  readonly DISCORD_CLIENT?: string
  readonly DISCORD_SECRET?: string
  readonly DISCORD_WEBHOOK_PATTERNS?: string
  readonly DISCORD_WEBHOOK_SKINS?: string
  readonly DISCORD_WEBHOOK_SETLISTS?: string
  readonly DISCORD_GUILD?: string
  readonly DISCORD_BOT_TOKEN?: string
  readonly QCLI_HOST_URL?: string
  readonly DB_URL?: string
  readonly JWT_SECRET?: string
  readonly QCLI_TURNSTILE_SITE_KEY?: string
  readonly TURNSTILE_SECRET_KEY?: string
  readonly SESSION_SECRET?: string
}
