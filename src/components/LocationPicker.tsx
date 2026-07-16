import "./LocationPicker.css";
import { useState, useRef, useEffect } from "react";
import { FaLocationArrow, FaExclamationCircle } from "react-icons/fa";

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
  const [error, setError] = useState("");

  const errorTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (errorTimeout.current) clearTimeout(errorTimeout.current);
    };
  }, []);

  const showError = (message: string) => {
    setError(message);

    if (errorTimeout.current) clearTimeout(errorTimeout.current);
    errorTimeout.current = setTimeout(() => setError(""), 4000);
  };

  const getCurrentLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      showError("Geolocation is not supported by this browser.");
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
          } else {
            showError("Unable to fetch address for this location.");
          }
        } catch (err) {
          showError("Failed to fetch location. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);

        switch (err.code) {
          case err.PERMISSION_DENIED:
            showError("Location permission denied.");
            break;
          case err.POSITION_UNAVAILABLE:
            showError("Location unavailable.");
            break;
          case err.TIMEOUT:
            showError("Location request timed out.");
            break;
          default:
            showError("Unable to get your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  return (
    <div className="location-picker">
      <button
        type="button"
        className="use-location-btn"
        onClick={getCurrentLocation}
        disabled={loading}
      >
        <span className="use-location-icon">
          <FaLocationArrow size={11} />
        </span>
        {loading ? "Locating..." : "Use Current Location"}
      </button>

      {error && (
        <div className="location-error-popover">
          <FaExclamationCircle size={12} />
          {error}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;