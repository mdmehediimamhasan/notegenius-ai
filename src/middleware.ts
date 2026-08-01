import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: ['/dashboard/:path*', '/upload/:path*', '/record/:path*', '/notes/:path*', '/chat/:path*', '/quiz/:path*', '/history/:path*', '/settings/:path*'],
}
