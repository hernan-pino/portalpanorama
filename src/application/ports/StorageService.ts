export interface StorageService {
  upload(buffer: Buffer, filename: string, mimeType: string): Promise<string>
  delete(url: string): Promise<void>
}
