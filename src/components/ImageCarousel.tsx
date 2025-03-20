import React, { useState } from "react";

type ImageCarouselProps = {
  images: string[];
  descriptions: string[];
  basePath?: string;
  fileExtension?: string;
  className?: string;
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  descriptions,
  basePath = "/images/",
  fileExtension = ".jpg",
  className = "",
}) => {
  const [currentImage, setCurrentImage] = useState(1);
  const totalImages = images.length;

  const navigateCarousel = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentImage((current) => (current === 1 ? totalImages : current - 1));
    } else {
      setCurrentImage((current) => (current === totalImages ? 1 : current + 1));
    }
  };

  return (
    <div className={`card bg-base-100 shadow-lg mb-6 ${className}`}>
      <figure className="px-6 pt-6 relative">
        <img
          src={`${basePath}${images[currentImage - 1]}${fileExtension}`}
          alt={`Image ${currentImage} of ${totalImages}`}
          className="rounded-lg"
        />
        <div className="absolute inset-0 flex items-center justify-between px-4">
          <button
            onClick={() => navigateCarousel("prev")}
            className="bg-base-300 hover:bg-primary text-primary hover:text-white p-2 rounded-full shadow-lg"
            aria-label="Previous image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => navigateCarousel("next")}
            className="bg-base-300 hover:bg-primary text-primary hover:text-white p-2 rounded-full shadow-lg"
            aria-label="Next image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </figure>
      <div className="card-body text-sm italic">
        <p>{descriptions[currentImage - 1]}</p>
        <div className="flex justify-center space-x-1 mt-2">
          {Array.from({ length: totalImages }).map((_, i) => (
            <button
              key={i}
              className={`h-2 w-2 rounded-full ${
                i + 1 === currentImage ? "bg-primary" : "bg-base-300"
              }`}
              onClick={() => setCurrentImage(i + 1)}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
