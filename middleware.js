export const config = { matcher: '/:path*' };

export default function middleware(request) {
    const ua = request.headers.get('user-agent') || '';
    const url = new URL(request.url);
    
    // Block view-source: referer
    const referer = request.headers.get('referer') || '';
    if (referer.startsWith('view-source:')) {
        return new Response('Access Denied', { status: 403 });
    }
    
    return new Response(null, { status: 200 });
}
