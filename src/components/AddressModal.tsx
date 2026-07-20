import "./AddressModal.css";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Rb_Button, Rb_Input, Rb_Label, } from "@rentbook/rentbook-ui-lib";
import { FaTimes } from "react-icons/fa";
import { Address } from "../types/user";
import LocationPicker, { LocationData } from "./LocationPicker";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => Promise<void>;
  address?: Address | null;
}

const AddressModal = ({ isOpen, onClose, onSave, address, }: AddressModalProps) => {
  const { register, handleSubmit, reset, setValue, formState: { errors }, } = useForm<Address>({
    defaultValues: {
      name: "",
      type: "home",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      phone: "",
      isDefault: false,
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setSaveError(null);

    if (address) {
      reset({
        ...address,
      });
    } else {
      reset({
        name: "",
        type: "home",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        phone: "",
        isDefault: false,
        location: {
          type: "Point",
          coordinates: [0, 0],
        },
      });
    }
  }, [address, isOpen, reset]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLocationSelect = (location: LocationData) => {
    const components = location.addressComponents;

    const street =
      components.road ||
      components.neighbourhood ||
      components.suburb ||
      "";

    const city =
      components.city ||
      components.town ||
      components.village ||
      "";

    const state = components.state || "";
    const country = components.country || "";
    const zipCode = components.postcode || "";

    setValue("street", street);
    setValue("city", city);
    setValue("state", state);
    setValue("country", country);
    setValue("zipCode", zipCode);

    setValue("location", {
      type: "Point",
      coordinates: [location.lng, location.lat],
    });
  };

  const submit = async (data: Address) => {
    setSaveError(null);
    setIsSaving(true);

    try {
      await onSave({
        ...data,
        location: {
          type: "Point",
          coordinates:
            data.location?.coordinates?.length === 2
              ? data.location.coordinates
              : [0, 0],
        },
      });

      reset();
    } catch (err) {
      console.log(err);
      setSaveError("Something went wrong while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOverlayClick = () => {
    if (isSaving) return;
    onClose();
  };

  const handleCloseClick = () => {
    if (isSaving) return;
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}

        <div className="modal-header">
          <h3 className="modal-title">
            {address ? "Edit Address" : "Add Address"}
          </h3>

          <div className="modal-header-actions">
            <LocationPicker onLocationSelect={handleLocationSelect} />

            <button
              type="button"
              className="close-btn"
              onClick={handleCloseClick}
              disabled={isSaving}
              aria-label="Close"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        <form
          id="address-form"
          className="modal-body"
          onSubmit={handleSubmit(submit)}
        >
          <div className="address-grid">

            <div className="form-group">
              <Rb_Label>
                Address Name
              </Rb_Label>

              <Rb_Input
                placeholder="Home"
                disabled={isSaving}
                {...register("name")}
              />
            </div>

            <div className="form-group">
              <Rb_Label required>
                Type
              </Rb_Label>

              <select
                className="rb-select"
                disabled={isSaving}
                {...register("type", {
                  required: true,
                })}
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group full-width">
              <Rb_Label required>
                Phone
              </Rb_Label>

              <Rb_Input
                placeholder="Phone Number"
                maxLength={10}
                disabled={isSaving}
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Enter a valid phone number",
                  },
                })}
              />

              {errors.phone && (
                <p className="error-text">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="form-group full-width">
              <Rb_Label required>
                Street
              </Rb_Label>

              <Rb_Input
                placeholder="Street"
                disabled={isSaving}
                {...register("street", {
                  required: "Street is required",
                })}
              />

              {errors.street && (
                <p className="error-text">
                  {errors.street.message}
                </p>
              )}
            </div>

            <div className="form-group">
              <Rb_Label required>
                City
              </Rb_Label>

              <Rb_Input
                placeholder="City"
                disabled={isSaving}
                {...register("city", {
                  required: "City is required",
                })}
              />

              {errors.city && (
                <p className="error-text">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="form-group">
              <Rb_Label required>
                State
              </Rb_Label>

              <Rb_Input
                placeholder="State"
                disabled={isSaving}
                {...register("state", {
                  required: "State is required",
                })}
              />

              {errors.state && (
                <p className="error-text">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div className="form-group">
              <Rb_Label required>
                Zip Code
              </Rb_Label>

              <Rb_Input
                placeholder="Zip Code"
                disabled={isSaving}
                {...register("zipCode", {
                  required: "Zip Code is required",
                })}
              />

              {errors.zipCode && (
                <p className="error-text">
                  {errors.zipCode.message}
                </p>
              )}
            </div>

            <div className="form-group">
              <Rb_Label required>
                Country
              </Rb_Label>

              <Rb_Input
                placeholder="Country"
                disabled={isSaving}
                {...register("country", {
                  required: "Country is required",
                })}
              />

              {errors.country && (
                <p className="error-text">
                  {errors.country.message}
                </p>
              )}
            </div>

            <div className="form-group full-width">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  disabled={isSaving}
                  {...register("isDefault")}
                />
                Set as Default Address
              </label>
            </div>

          </div>

          {saveError && (
            <p className="error-text modal-error-banner">
              {saveError}
            </p>
          )}
        </form>


        <div className="modal-footer">
          <Rb_Button
            variant="outline"
            onClick={handleCloseClick}
            disabled={isSaving}
          >
            Cancel
          </Rb_Button>

          <Rb_Button
            type="submit"
            form="address-form"
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="save-btn-loading">
                <span className="btn-spinner-sm" />
                {address ? "Updating..." : "Saving..."}
              </span>
            ) : address ? (
              "Update Address"
            ) : (
              "Save Address"
            )}
          </Rb_Button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;