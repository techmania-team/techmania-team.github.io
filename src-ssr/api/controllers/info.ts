import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { changelogs, releases } from '../models/info'

export const getReleases = (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result: releases,
  })
}

export const getChangelogs = (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result: changelogs,
  })
}
