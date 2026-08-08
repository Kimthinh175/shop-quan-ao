import { ApiClient } from './ApiClient';

export class UploadService {
  /**
   * Upload an image to Cloudinary via Backend
   * @param file The File object from input[type="file"]
   * @returns The uploaded image URL (Cloudinary URL)
   */
  static async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const baseUrl = (ApiClient as any).baseUrl || 'http://localhost:3000/api';

    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Upload Failed: ${errBody}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Upload failed');
    }

    return data.url;
  }

  /**
   * Delete an image from Cloudinary via Backend
   * @param url The Cloudinary URL to delete
   * @returns boolean indicating success
   */
  static async deleteImage(url: string): Promise<boolean> {
    if (!url) return false;

    const baseUrl = (ApiClient as any).baseUrl || 'http://localhost:3000/api';

    const response = await fetch(`${baseUrl}/upload`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`Delete Failed: ${errBody}`);
      return false;
    }

    const data = await response.json();
    return data.success === true;
  }
}
