import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
} from 'firebase/storage';
import {getFirebaseApp} from './config';
import {STORAGE_PATHS} from '@/constants';

const storage = () => getStorage(getFirebaseApp());

const uriToBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  return response.blob();
};

export const storageApi = {
  async uploadReceipt(uid: string, localUri: string): Promise<string> {
    const filename = `${Date.now()}.jpg`;
    const path = `${STORAGE_PATHS.RECEIPTS}/${uid}/${filename}`;
    const storageRef = ref(storage(), path);
    const blob = await uriToBlob(localUri);
    await uploadBytes(storageRef, blob, {contentType: 'image/jpeg'});
    return getDownloadURL(storageRef);
  },

  async uploadProfilePhoto(uid: string, localUri: string): Promise<string> {
    const path = `${STORAGE_PATHS.PROFILES}/${uid}/avatar.jpg`;
    const storageRef = ref(storage(), path);
    const blob = await uriToBlob(localUri);
    await uploadBytes(storageRef, blob, {contentType: 'image/jpeg'});
    return getDownloadURL(storageRef);
  },

  async deleteFile(downloadUrl: string): Promise<void> {
    try {
      const storageRef = ref(storage(), downloadUrl);
      await deleteObject(storageRef);
    } catch (error) {
      console.warn('[Track] delete storage file failed', error);
    }
  },
};
