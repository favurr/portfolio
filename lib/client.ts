import { treaty } from '@elysia/eden'
import type { app } from '../app/api/[[...slugs]]/route'

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  return 'http://localhost:3000';
}

// .api to enter /api prefix
export const client = treaty<app>(getBaseUrl()).api