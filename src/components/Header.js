// 
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Dropzone from 'react-dropzone';
import imageCompression from 'browser-image-compression';

const Header = () => {
  const router = useRouter();
  const [userImage, setUserImage] = useState('https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/47.jpg');
  const [newImage, setNewImage] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    console.log('Original File size:', file.size / 1024 / 1024, 'MB');

    const options = {
      maxSizeMB: 0.55,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      console.log('Compressed File size:', compressedFile.size / 1024 / 1024, 'MB');
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error during image compression:', error);
    }
  };

  const handleSaveImage = async () => {
    if (newImage) {
      setUserImage(newImage);
      setNewImage(null);
      setUploadModalOpen(false);
    }
  };

  const handleCancel = () => {
    setNewImage(null);
    setUploadModalOpen(false);
  };

  const handleTitleClick = () => {
    router.push('/');
  };

  return (
    <header className="bg-pink-600 text-white p-6 flex items-center justify-between relative shadow-lg">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={handleTitleClick}>
          Frontend Assignment
        </h1>
        <p className="hidden sm:block"> Stonks</p>
      </div>
      <div className="flex items-center relative">
        <span className="mr-4 hidden sm:block">Vanshika Mehrotra</span>
        <img
          src={newImage || userImage}
          alt="Vanshika Mehrotra"
          className="h-12 w-12 rounded-full cursor-pointer border-2 border-white shadow-md"
          onClick={() => setUploadModalOpen(!uploadModalOpen)}
        />
        {uploadModalOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white border border-pink-300 shadow-lg z-50 p-4 w-80 sm:w-96 rounded-lg">
            <Dropzone onDrop={onDrop}>
              {({ getRootProps, getInputProps }) => (
                <section>
                  <div
                    {...getRootProps({ className: 'dropzone' })}
                    className="p-4 border-dashed border-2 border-pink-300 rounded-lg text-center cursor-pointer"
                  >
                    <input {...getInputProps()} accept="image/*" />
                    <p className="text-pink-700 font-semibold">
                      Click or drop a new profile image here
                    </p>
                  </div>
                </section>
              )}
            </Dropzone>
            {newImage && (
              <div className="mt-4">
                <img src={newImage} alt="Preview" className="w-full rounded-lg" />
                <div className="flex justify-between mt-4">
                  <button
                    onClick={handleSaveImage}
                    className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
                  >
                    Save Image
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
