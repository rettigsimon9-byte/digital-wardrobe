import { withAuth } from 'next-auth/middleware';

export default withAuth({
  secret: 'wardrobe-super-secret-key-2024',
});

export const config = {
  matcher: ['/', '/upload', '/generate', '/outfits'],
};
