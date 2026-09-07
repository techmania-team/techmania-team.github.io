import type { NextFunction, Request, RequestHandler, Response } from 'express'
import axios, { AxiosError } from 'axios'
import FormData from 'form-data'
import { StatusCodes } from 'http-status-codes'

export interface TurnstileOptions {
  secretKey?: string | undefined
  timeout?: number | undefined
  expectedAction?: string | undefined
  expectedHostname?: string | undefined
  idempotencyKey?: string | undefined
}

export interface TurnstileResult {
  success: boolean
  error?: string | undefined
  expected?: string | undefined
  received?: string | undefined
  action?: string | undefined
  hostname?: string | undefined
  challenge_ts?: string | undefined
  cdata?: string | undefined
}

export class TurnstileValidator {
  private secretKey: string
  private timeout: number

  constructor(secretKey: string, timeout: number = 10000) {
    this.secretKey = secretKey
    this.timeout = timeout
  }

  async validate(
    token: string,
    remoteip?: string,
    options: TurnstileOptions = {},
  ): Promise<TurnstileResult> {
    if (!token || typeof token !== 'string') {
      return { success: false, error: 'Invalid token format' }
    }

    if (token.length > 2048) {
      return { success: false, error: 'Token too long' }
    }

    try {
      const formData = new FormData()
      formData.append('secret', this.secretKey)
      formData.append('response', token)

      if (remoteip) {
        formData.append('remoteip', remoteip)
      }

      if (options.idempotencyKey) {
        formData.append('idempotency_key', options.idempotencyKey)
      }

      const response = await axios.post<{
        success: boolean
        action?: string
        hostname?: string
        challenge_ts?: string
        cdata?: string
        'error-codes'?: string[]
      }>('https://challenges.cloudflare.com/turnstile/v0/siteverify', formData, {
        timeout: this.timeout,
      })

      const result = response.data

      if (result.success) {
        if (options.expectedAction && result.action !== options.expectedAction) {
          return {
            success: false,
            error: 'Action mismatch',
            expected: options.expectedAction,
            received: result.action,
          }
        }

        if (options.expectedHostname && result.hostname !== options.expectedHostname) {
          return {
            success: false,
            error: 'Hostname mismatch',
            expected: options.expectedHostname,
            received: result.hostname,
          }
        }
      } else {
        return {
          success: false,
          error: result['error-codes']?.join(', ') || 'Unknown Turnstile Error',
        }
      }

      return {
        success: true,
        action: result.action,
        hostname: result.hostname,
        challenge_ts: result.challenge_ts,
        cdata: result.cdata,
      }
    } catch (error) {
      if (error instanceof AxiosError && error.code === 'ECONNABORTED') {
        return { success: false, error: 'Validation timeout' }
      }
      // Keep the cause: the middleware only ever tells the caller that
      // validation failed, so this text exists purely for the server log
      return {
        success: false,
        error: `Internal error: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }
}

export default (options: TurnstileOptions = {}): RequestHandler => {
  const secretKey = options.secretKey || import.meta.env.TURNSTILE_SECRET_KEY || ''
  const validator = new TurnstileValidator(secretKey, options.timeout)

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.body['cf-turnstile-response']
    const remoteip = req.ip

    if (!token || typeof token !== 'string') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: 'Turnstile token is missing',
      })
      return
    }

    const result = await validator.validate(token, remoteip, {
      expectedAction: options.expectedAction,
      expectedHostname: options.expectedHostname,
    })

    if (!result.success) {
      // The reason never reaches the caller, so without this a rejection in
      // production is indistinguishable from any other 403. Action and
      // hostname mismatches in particular look like nothing at all.
      const detail = [
        result.error,
        result.expected !== undefined ? `expected=${result.expected}` : undefined,
        result.received !== undefined ? `received=${result.received}` : undefined,
      ]
        .filter(Boolean)
        .join(' ')
      console.error(`[turnstile] rejected ${req.method} ${req.originalUrl}: ${detail}`)

      res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Turnstile validation failed',
      })
      return
    }

    next()
  }
}
