import { NextResponse } from 'next/server';

export function middleware(request) {
	const token = request.cookies.get('token')?.value;
	const { pathname } = request.nextUrl;

	const authPages = ['/login', '/signup'];
	const protectedPages = ['/dashboard', '/chat'];

	const isAuthPage = authPages.some(page => pathname.startsWith(page));
	const isProtectedPage = protectedPages.some(page => pathname.startsWith(page));

	if (token && isAuthPage) {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	if (!token && isProtectedPage) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};