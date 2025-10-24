import api from '@/lib/axios';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    image_url: string;
    filename: string;
    size: number;
    mimetype: string;
  };
}

export const uploadService = {
  // Upload single image
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<UploadResponse>('/api/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Upload multiple images
  uploadImages: async (files: File[]): Promise<{ images: string[] }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post<{
      success: boolean;
      data: { images: Array<{ image_url: string }> };
    }>('/api/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      images: response.data.data.images.map((img) => img.image_url),
    };
  },
};
