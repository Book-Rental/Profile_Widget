import "./LocationPicker.css";
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
      showToast("Geolocation is not supported by this browser.", "error");
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

            showToast("Location detected successfully.", "success");
          } else {
            showToast("Unable to fetch address for this location.", "error");
          }
        } catch (err) {
          showToast("Failed to fetch location. Please try again.", "error");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);

        switch (err.code) {
          case err.PERMISSION_DENIED:
            showToast("Location permission denied.", "error");
            break;
          case err.POSITION_UNAVAILABLE:
            showToast("Location unavailable.", "error");
            break;
          case err.TIMEOUT:
            showToast("Location request timed out.", "error");
            break;
          default:
            showToast("Unable to get your location.", "error");
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
    </div>
  );
};

export default LocationPicker;