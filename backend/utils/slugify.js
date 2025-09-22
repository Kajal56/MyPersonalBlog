/**
 * Convert a title to a URL-friendly slug
 * @param {string} title - The title to convert
 * @returns {string} - URL-friendly slug
 */
function slugify(title) {
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
function generateUniqueSlug(title, existingSlugs = []) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

module.exports = { slugify, generateUniqueSlug };
