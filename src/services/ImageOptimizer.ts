/**
 * Image Optimization Service
 * 
 * This service provides utilities for optimizing images before upload
 * and generating responsive image variants.
 */

interface ImageDimensions {
  width: number;
  height: number;
}

interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  progressive?: boolean;
}

interface OptimizedImage {
  file: File;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
  format: string;
}

interface ResponsiveImageSet {
  original: File;
  variants: {
    file: File;
    width: number;
    height: number;
    size: number;
  }[];
}

export class ImageOptimizer {
  /**
   * Optimize an image before upload
   */
  public static async optimizeImage(
    imageFile: File,
    options: OptimizationOptions = {}
  ): Promise<OptimizedImage> {
    const originalSize = imageFile.size;
    
    // Default options
    const opts = {
      maxWidth: options.maxWidth || 1920,
      maxHeight: options.maxHeight || 1080,
      quality: options.quality || 80,
      format: options.format || 'webp',
      progressive: options.progressive !== undefined ? options.progressive : true
    };
    
    // Create an image element to load the file
    const img = document.createElement('img');
    const imageUrl = URL.createObjectURL(imageFile);
    
    // Wait for the image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });
    
    // Calculate dimensions while maintaining aspect ratio
    const dimensions = this.calculateDimensions(
      img.naturalWidth,
      img.naturalHeight,
      opts.maxWidth,
      opts.maxHeight
    );
    
    // Create a canvas to resize the image
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Draw the image on the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
    
    // Convert to the desired format
    const mimeType = `image/${opts.format}`;
    const quality = opts.quality / 100;
    
    // Get the optimized image as a blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((result) => {
        if (result) {
          resolve(result);
        } else {
          // Fallback if the requested format is not supported
          canvas.toBlob((fallbackResult) => {
            resolve(fallbackResult!);
          }, 'image/jpeg', quality);
        }
      }, mimeType, quality);
    });
    
    // Clean up
    URL.revokeObjectURL(imageUrl);
    
    // Create a new file from the blob
    const optimizedFile = new File(
      [blob],
      `${this.getFileNameWithoutExtension(imageFile.name)}.${opts.format}`,
      { type: mimeType }
    );
    
    return {
      file: optimizedFile,
      originalSize,
      optimizedSize: optimizedFile.size,
      width: dimensions.width,
      height: dimensions.height,
      format: opts.format
    };
  }
  
  /**
   * Generate responsive image variants for different screen sizes
   */
  public static async generateResponsiveImages(
    imageFile: File,
    breakpoints: number[] = [640, 768, 1024, 1280, 1536]
  ): Promise<ResponsiveImageSet> {
    const variants = [];
    
    // Create an image element to load the file
    const img = document.createElement('img');
    const imageUrl = URL.createObjectURL(imageFile);
    
    // Wait for the image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });
    
    // Generate a variant for each breakpoint
    for (const width of breakpoints) {
      // Skip if the original image is smaller than this breakpoint
      if (width >= img.naturalWidth) continue;
      
      // Calculate height while maintaining aspect ratio
      const height = Math.round((width / img.naturalWidth) * img.naturalHeight);
      
      // Create a canvas to resize the image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw the image on the canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to WebP for best compression
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((result) => {
          if (result) {
            resolve(result);
          } else {
            // Fallback to JPEG if WebP is not supported
            canvas.toBlob((fallbackResult) => {
              resolve(fallbackResult!);
            }, 'image/jpeg', 0.8);
          }
        }, 'image/webp', 0.8);
      });
      
      // Create a new file from the blob
      const variantFile = new File(
        [blob],
        `${this.getFileNameWithoutExtension(imageFile.name)}_${width}.webp`,
        { type: 'image/webp' }
      );
      
      variants.push({
        file: variantFile,
        width,
        height,
        size: variantFile.size
      });
    }
    
    // Clean up
    URL.revokeObjectURL(imageUrl);
    
    return {
      original: imageFile,
      variants
    };
  }
  
  /**
   * Calculate dimensions while maintaining aspect ratio
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): ImageDimensions {
    let width = originalWidth;
    let height = originalHeight;
    
    // Scale down if width exceeds maxWidth
    if (width > maxWidth) {
      height = Math.round((maxWidth / width) * height);
      width = maxWidth;
    }
    
    // Scale down further if height still exceeds maxHeight
    if (height > maxHeight) {
      width = Math.round((maxHeight / height) * width);
      height = maxHeight;
    }
    
    return { width, height };
  }
  
  /**
   * Get file name without extension
   */
  private static getFileNameWithoutExtension(fileName: string): string {
    return fileName.replace(/\.[^/.]+$/, '');
  }
  
  /**
   * Check if the browser supports the WebP format
   */
  public static async isWebPSupported(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = () => resolve(true);
      webP.onerror = () => resolve(false);
      webP.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    });
  }
  
  /**
   * Check if the browser supports the AVIF format
   */
  public static async isAvifSupported(): Promise<boolean> {
    return new Promise((resolve) => {
      const avif = new Image();
      avif.onload = () => resolve(true);
      avif.onerror = () => resolve(false);
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  }
}

export default ImageOptimizer;