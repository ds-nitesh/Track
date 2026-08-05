import {useCallback, useMemo, useState} from 'react';
import {launchCamera, launchImageLibrary, ImagePickerResponse} from 'react-native-image-picker';
import {Alert, Platform} from 'react-native';

export const useImagePicker = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  const handleResult = useCallback((result: ImagePickerResponse) => {
    setPicking(false);
    if (result.didCancel || result.errorCode) {
      return;
    }
    const uri = result.assets?.[0]?.uri;
    if (uri) {
      setImageUri(uri);
    }
  }, []);

  const pickFromGallery = useCallback(() => {
    setPicking(true);
    launchImageLibrary(
      {mediaType: 'photo', quality: 0.8, selectionLimit: 1},
      handleResult,
    );
  }, [handleResult]);

  const pickFromCamera = useCallback(() => {
    setPicking(true);
    launchCamera({mediaType: 'photo', quality: 0.8, saveToPhotos: false}, handleResult);
  }, [handleResult]);

  const showPicker = useCallback(() => {
    Alert.alert('Select image', 'Choose a source', [
      {text: 'Camera', onPress: pickFromCamera},
      {text: 'Gallery', onPress: pickFromGallery},
      {text: 'Cancel', style: 'cancel'},
    ]);
  }, [pickFromCamera, pickFromGallery]);

  const clear = useCallback(() => setImageUri(null), []);

  return useMemo(
    () => ({
      imageUri,
      setImageUri,
      picking,
      showPicker,
      pickFromGallery,
      pickFromCamera,
      clear,
      isIOS: Platform.OS === 'ios',
    }),
    [imageUri, picking, showPicker, pickFromGallery, pickFromCamera, clear],
  );
};
