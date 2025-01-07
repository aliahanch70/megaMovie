export async function validateImageFile(file: File): Promise<void> {
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error('Image size must be less than 5MB');
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Image must be in JPG, PNG, or WebP format');
  }

  // Additional image validation could be added here
  // For example, checking dimensions, aspect ratio, etc.
}