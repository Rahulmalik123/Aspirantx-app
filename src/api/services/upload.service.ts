import apiClient from '../client';

export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    publicId: string;
    format?: string;
    bytes?: number;
  };
  message: string;
}

export const uploadService = {
  /**
   * Upload single image
   */
  uploadImage: async (file: any, folder?: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || file.name || 'image.jpg',
    } as any);
    
    if (folder) {
      formData.append('folder', folder);
    }

    return apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Upload multiple images
   */
  uploadImages: async (files: any[], folder?: string): Promise<any> => {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('files', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.fileName || file.name || `image_${index}.jpg`,
      } as any);
    });
    
    if (folder) {
      formData.append('folder', folder);
    }

    return apiClient.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Upload document (PDF, DOC, etc.)
   */
  uploadDocument: async (file: any, folder?: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'application/pdf',
      name: file.fileName || file.name || 'document.pdf',
    } as any);
    
    if (folder) {
      formData.append('folder', folder);
    }

    return apiClient.post('/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Upload video
   */
  uploadVideo: async (file: any, folder?: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'video/mp4',
      name: file.fileName || file.name || 'video.mp4',
    } as any);
    
    if (folder) {
      formData.append('folder', folder);
    }

    return apiClient.post('/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (file: any): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || file.name || 'profile.jpg',
    } as any);

    return apiClient.post('/upload/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Upload post images
   */
  uploadPostImages: async (files: any[]): Promise<any> => {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('files', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.fileName || file.name || `post_${index}.jpg`,
      } as any);
    });

    return apiClient.post('/api/v1/upload/post-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete file from Cloudinary
   */
  deleteFile: async (publicId: string, resourceType: 'image' | 'raw' = 'image'): Promise<any> => {
    return apiClient.delete('/upload/delete', {
      data: { publicId, resourceType },
    });
  },
};

export default uploadService;
