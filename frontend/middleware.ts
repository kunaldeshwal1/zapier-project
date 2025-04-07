import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the token from cookies
  const token = request.cookies.get('token')

  // If there's no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
    matcher: [
      '/dashboard/:path*',
      '/zap/:path*',
      '/zap/create',
      '/zap'  // Protect the base zap route as well
    ]
  }