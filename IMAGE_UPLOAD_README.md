# Firebase Storage Image Upload System

This document explains how the image upload system works in the Gentivo application.

## Overview

The system uses Firebase Storage to upload and store images. The main functionality is centralized in a single utility function that handles validation, uploading, and retrieving the download URL.

## Configuration

The Firebase Storage is configured with the following bucket:
```
gs://gentivo-7cd8d.firebasestorage.app
```

## Core Components

### 1. Upload Utility Function

The core of the system is the `uploadImageToFirebase` utility function located in `src/utils/firebaseUpload.ts`. This function:

- Validates that the file is an image
- Ensures the file size is under 5MB
- Generates a unique filename
- Uploads the file to Firebase Storage
- Returns the download URL

Usage:

```typescript
import { uploadImageToFirebase } from '../utils/firebaseUpload';

// ...

try {
  const downloadUrl = await uploadImageToFirebase(file, 'folder/path');
  console.log('Upload successful!', downloadUrl);
} catch (error) {
  console.error('Upload failed:', error);
}
```

### 2. UI Components

Two main components are available for image uploads:

#### SimpleImageUploader

A basic image uploader with minimal styling, located in `src/components/simple/SimpleImageUploader.tsx`.

```tsx
<SimpleImageUploader
  folder="images/profile"
  currentImageUrl={user.profileImage}
  buttonLabel="Upload Profile Picture"
  onImageUploaded={(url) => setProfileImage(url)}
/>
```

#### ImageUploader

A more feature-rich uploader with preview and progress indicator, located in `src/components/common/ImageUploader.tsx`.

```tsx
<ImageUploader
  storageFolder="salons/logos"
  currentImageUrl={salon.logoUrl}
  label="Upload Logo"
  onImageUploaded={handleLogoUploaded}
  onError={handleUploadError}
  className="mt-4"
/>
```

### 3. Testing Components

For testing Firebase Storage connectivity:

- `DirectUpload.tsx`: A standalone component for direct uploads
- `TestFileUpload.tsx`: A simple test component
- `firebaseStorageTest.ts`: A utility to test Storage connectivity

## Storage Rules

The Firebase Storage security rules are configured to:

1. Allow public read access to all files
2. Allow authenticated users to upload images to specific folders
3. Enforce file size limits (5MB for normal images, 10MB for test files)
4. Enforce file type validation for image folders

See `firebase-storage-rules.txt` for the complete rules configuration.

## Folder Structure

- `salons/{salonId}/*`: Salon-specific images
- `uploads/*`: General-purpose uploads
- `test-uploads/*`: Files for testing purposes
- `test/*`: Connection test files
- `diagnostics/*`: Diagnostic files for troubleshooting

## Troubleshooting

If uploads are failing:

1. Check browser console for detailed error messages
2. Verify Firebase configurations in `src/firebase/config.ts`
3. Use the `Test Storage Connection` button in the UI
4. Check that Firebase Storage rules allow uploads to the target folder
5. Verify that the file is a valid image and under size limits 