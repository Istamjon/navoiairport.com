import { randomUUID } from 'crypto'

/**
 * Payload CMS uchun avtomatik fayl nomi generatsiya qilish va yuklash
 * 
 * Tavsif:
 * - Bo'sh joy va maxsus belgilarni _ ga almashtiradi
 * - Timestamp + UUID orqali unik fayl nomi yaratadi
 * - Payload media collection'iga yuklaydi
 * - Natijadagi URL'ni encode qiladi
 */

/**
 * Sanitizes filename by replacing spaces and special characters with underscores
 * @param filename Original filename
 * @returns Sanitized filename safe for file systems and URLs
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return ''

  // Extract file extension
  const lastDotIndex = filename.lastIndexOf('.')
  const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename
  const ext = lastDotIndex > 0 ? filename.substring(lastDotIndex) : ''

  // Replace spaces and special characters with underscores
  // Keep only alphanumeric, hyphens, and underscores
  const sanitizedName = name
    .replace(/\s+/g, '_') // Replace spaces with underscore
    .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace special chars with underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores

  return sanitizedName + ext.toLowerCase()
}

/**
 * Generates unique filename with timestamp and UUID
 * @param originalFilename Original filename
 * @returns Unique filename with timestamp and UUID prefix
 */
export function generateUniqueFilename(originalFilename: string): string {
  const sanitized = sanitizeFilename(originalFilename)
  const timestamp = Date.now()
  const uuid = randomUUID().split('-')[0] // Use first segment of UUID (8 chars)

  // Extract extension
  const lastDotIndex = sanitized.lastIndexOf('.')
  const name = lastDotIndex > 0 ? sanitized.substring(0, lastDotIndex) : sanitized
  const ext = lastDotIndex > 0 ? sanitized.substring(lastDotIndex) : ''

  // Format: timestamp_uuid_originalname.ext
  return `${timestamp}_${uuid}_${name}${ext}`
}

/**
 * Validates filename for security
 * @param filename Filename to validate
 * @returns true if filename is safe
 */
export function isValidFilename(filename: string): boolean {
  if (!filename || filename.length === 0) return false
  if (filename.length > 255) return false // Max filename length

  // Check for path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false
  }

  // Check for null bytes
  if (filename.includes('\0')) {
    return false
  }

  return true
}
