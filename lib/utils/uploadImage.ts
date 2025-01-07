export async function uploadImageToPublic(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    // بررسی وضعیت پاسخ
    if (!response.ok) {
      const errorDetails = await response.text();
      console.error('Upload error:', response.status, errorDetails);
      throw new Error(`Failed to upload image: ${response.status}`);
    }

    const data = await response.json();
    return data.url; // فرض بر این است که URL تصویر در پاسخ JSON است
  } catch (error) {
    console.error('Error in uploadImageToPublic:', error);
    throw new Error('Failed to upload image');
  }
}
