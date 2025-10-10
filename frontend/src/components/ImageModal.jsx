import React, { useEffect, useState } from "react";

const ImageModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Automatically open modal on every reload
  useEffect(() => {
    setIsOpen(true);
  }, []);

  // Close modal handler
  const closeModal = () => setIsOpen(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="relative">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute -top-4 -right-4 bg-white text-gray-700 rounded-full p-1 shadow-md hover:bg-gray-100 transition"
        >
          ✕
        </button>

        {/* Image */}
        <img
          src="/images/dhamaka.jpeg" // replace with your Diwali image
          alt="Diwali Offer"
          className="rounded-lg shadow-lg max-w-[100vw] max-h-[80vh] object-contain"
        />
      </div>
    </div>
  );
};

export default ImageModal;
