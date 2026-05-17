import { withAuth } from 'next-auth/middleware';

// Ensure secret is always available regardless of env var setup
process.env.NEXTAUTH_SECRET ??= 'wardrobe-super-secret-key-2024';

export default withAuth({
  secret: 'wardrobe-super-secret-key-2024',
});

export const config = {
  matcher: ['/', '/upload', '/generate', '/outfits'],
};
