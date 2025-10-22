import * as React from "react";
import { landingCarouselImages } from "../lib/carousel-images";

type BackgroundCarouselProps = {
  images?: string[];
  intervalMs?: number;
};

export function BackgroundCarousel({
  images = landingCarouselImages,
  intervalMs = 5000,
}: BackgroundCarouselProps) {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images.length, intervalMs]);

  return (
    <div className="absolute inset-0 -z-10">
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
            src={src}
            alt="Background"
            className="w-full h-full object-cover object-center"
          />
        </div>
      ))}
    </div>
  );
}

export default BackgroundCarousel;
