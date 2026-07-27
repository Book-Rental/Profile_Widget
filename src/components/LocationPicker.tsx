import { useState } from "react";
import { FaLocationArrow } from "react-icons/fa";
import { showToast } from "../utils/showToast";

const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  addressComponents: {
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
    county?: string;
    [key: string]: any;
  };
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
}

const LocationPicker = ({
  onLocationSelect,
}: LocationPickerProps) => {
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast(
        "Geolocation is not supported by this browser.",
        "error"
      );
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`
          );

          const data = await response.json();

          if (data.results && data.results.length > 0) {
            const result = data.results[0];

            onLocationSelect({
              lat: latitude,
              lng: longitude,
              address: result.formatted,
              addressComponents: result.components,
            });

            showToast(
              "Location detected successfully.",
              "success"
            );
          } else {
            showToast(
              "Unable to fetch address for this location.",
              "error"
            );
          }
        } catch (err) {
          showToast(
            "Failed to fetch location. Please try again.",
            "error"
          );
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);

        switch (err.code) {
          case err.PERMISSION_DENIED:
            showToast(
              "Location permission denied.",
              "error"
            );
            break;

          case err.POSITION_UNAVAILABLE:
            showToast(
              "Location unavailable.",
              "error"
            );
            break;

          case err.TIMEOUT:
            showToast(
              "Location request timed out.",
              "error"
            );
            break;

          default:
            showToast(
              "Unable to get your location.",
              "error"
            );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  return (
    <div className="w-auto shrink-0">
      <button
        type="button"
        onClick={getCurrentLocation}
        disabled={loading}
        aria-label="Use Current Location"
        title="Use Current Location"
        className="
        group
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        gap-2
        rounded-full
        border
        border-violet-700
        bg-white
        text-violet-700
        transition-all
        duration-150
        ease-in-out

        hover:bg-violet-700
        hover:text-white
        hover:shadow-[0_4px_12px_rgba(109,40,217,0.25)]

        focus:outline-none
        focus:ring-2
        focus:ring-violet-200
        focus:ring-offset-1

        disabled:cursor-not-allowed
        disabled:opacity-60
        disabled:hover:bg-white
        disabled:hover:text-violet-700
        disabled:hover:shadow-none

        sm:h-[42px]
        sm:w-auto
        sm:justify-start
        sm:px-4
      "
      >
        <span
          className="
          flex
          h-6
          w-6
          min-w-6
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-violet-50
          text-violet-700
          transition-colors
          duration-150
          group-hover:bg-white/20
          group-hover:text-white
        "
        >
          <FaLocationArrow size={11} />
        </span>

        <span className="hidden whitespace-nowrap text-xs font-semibold sm:inline">
          {loading ? "Locating..." : "Use Current Location"}
        </span>
      </button>
    </div>
  );
};

export default LocationPicker;