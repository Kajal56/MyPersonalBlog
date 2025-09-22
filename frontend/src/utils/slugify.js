/**
 * Convert a title to a URL-friendly slug
 * @param {string} title - The title to convert
 * @returns {string} - URL-friendly slug
 */
export function slugify(title) {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if needed
 * @param {string} title - The title to convert
 * @param {Array} existingSlugs - Array of existing slugs to avoid duplicates
 * @returns {string} - Unique slug
 */
export function generateUniqueSlug(title, existingSlugs = []) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Extract title from slug (for display purposes)
 * @param {string} slug - The slug to convert back
 * @returns {string} - Human readable title
 */
export function unslugify(slug) {
  if (!slug) return '';
  
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
