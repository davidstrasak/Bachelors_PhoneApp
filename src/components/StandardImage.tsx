import React from "react";

type StandardImageProps = {
  src: string;
  alt: string;
  caption: string;
  className?: string;
};

const StandardImage: React.FC<StandardImageProps> = ({
  src,
  alt,
  caption,
  className = "",
}) => {
  return (
    <div className={`card bg-base-100 shadow-lg mb-6 ${className}`}>
      <figure className="px-6 pt-6">
        <img src={src} alt={alt} className="rounded-lg" />
      </figure>
      <div className="card-body text-sm italic">{caption}</div>
    </div>
  );
};

export default StandardImage;
