import { Request, Response, NextFunction } from 'express'
import { AppError, ValidationError } from '../utils/errors'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err)

  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      fields: err.fields,
    })
    return
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    })
    return
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      success: false,
      error: 'Database operation failed',
    })
    return
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  })
}
