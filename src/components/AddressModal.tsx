import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Rb_Button,
  Rb_Input,
  Rb_Label,
} from "@rentbook/rentbook-ui-lib";
import { FaTimes } from "react-icons/fa";

import { Address } from "../types/user";
import LocationPicker, {
  LocationData,
} from "./LocationPicker";
import { showToast } from "../utils/showToast";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => Promise<void>;
  address?: Address | null;
}

const AddressModal = ({
  isOpen,
  onClose,
  onSave,
  address,
}: AddressModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Address>({
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

  const UNNAMED_ROAD_PATTERN = /^unnamed road$/i;

  const cleanField = (value?: string) =>
    value && !UNNAMED_ROAD_PATTERN.test(value.trim())
      ? value
      : "";

  const handleLocationSelect = (
    location: LocationData
  ) => {
    const components = location.addressComponents;

    const street =
      cleanField(components.road) ||
      cleanField(components.neighbourhood) ||
      cleanField(components.suburb) ||
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
      coordinates: [
        location.lng,
        location.lat,
      ],
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

      showToast(
        address
          ? "Address updated successfully."
          : "Address saved successfully.",
        "success"
      );

      reset();
    } catch (err) {
      console.log(err);

      const message =
        "Something went wrong while saving. Please try again.";

      setSaveError(message);

      showToast(
        message,
        "error"
      );
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
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
           relative
    flex
    w-full
    max-w-[720px]
    max-h-[90vh]
    flex-col
    overflow-hidden
    rounded-2xl
    bg-white
    shadow-2xl
        "
      >
        <div
          className="
    flex
    min-w-0
    items-center
    justify-between
    gap-3
    border-b
    border-gray-200
    px-4
    py-3
    sm:px-6
    sm:py-4
  "
        >
          <h3
            className="
      min-w-0
      truncate
      text-lg
      font-semibold
      text-gray-900
      sm:text-2xl
    "
          >
            {address ? "Edit Address" : "Add Address"}
          </h3>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LocationPicker
              onLocationSelect={handleLocationSelect}
            />

            <button
              type="button"
              onClick={handleCloseClick}
              disabled={isSaving}
              aria-label="Close modal"
              className="
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-full
        text-gray-500
        transition
        hover:bg-gray-100
        hover:text-gray-700
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>
        <form
          id="address-form"
          onSubmit={handleSubmit(submit)}
          className="
            flex-1
            overflow-y-auto
            px-4
            py-5
            sm:px-6
            sm:py-6
          "
        >
          <div
            className="
              grid
              grid-cols-1
              gap-x-5
              gap-y-4
              md:grid-cols-2
            "
          >
            <div className="flex min-w-0 flex-col gap-1">
              <Rb_Label
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-700
                "
              >
                Address Name
              </Rb_Label>

              <Rb_Input
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  px-3
                  text-sm
                  text-gray-700
                "
                placeholder="Home"
                disabled={isSaving}
                {...register("name")}
              />
            </div>

            <div className="flex min-w-0 flex-col gap-1">
              <Rb_Label
                required
                className="
                  !mb-2.5
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-700
                "
              >
                Type
              </Rb_Label>

              <select
                {...register("type")}
                disabled={isSaving}
                className="
                  h-[38px]
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-3
                  text-sm
                  text-gray-700
                  outline-none
                  transition
                  focus:border-violet-500
                  focus:ring-2
                  focus:ring-violet-100
                  disabled:cursor-not-allowed
                  disabled:bg-gray-50
                "
              >
                <option value="home">
                  Home
                </option>

                <option value="work">
                  Work
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>

            <div
              className="
                flex
                min-w-0
                flex-col
                gap-1
                md:col-span-2
              "
            >
              <Rb_Label
                required
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-600
                "
              >
                Phone
              </Rb_Label>

              <Rb_Input
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  px-3
                  text-sm
                  text-gray-700
                "
                placeholder="Phone Number"
                maxLength={10}
                disabled={isSaving}
                {...register("phone", {
                  required:
                    "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message:
                      "Enter a valid phone number",
                  },
                })}
              />

              {errors.phone && (
                <p className="text-xs text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div
              className="
                flex
                min-w-0
                flex-col
                gap-1
                md:col-span-2
              "
            >
              <Rb_Label
                required
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-600
                "
              >
                Street
              </Rb_Label>

              <Rb_Input
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  px-3
                  text-sm
                  text-gray-700
                "
                placeholder="Street"
                disabled={isSaving}
                {...register("street", {
                  required:
                    "Street is required",
                })}
              />

              {errors.street && (
                <p className="text-xs text-red-600">
                  {errors.street.message}
                </p>
              )}
            </div>


            <div className="flex min-w-0 flex-col gap-1">
              <Rb_Label
                required
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-700
                "
              >
                City
              </Rb_Label>

              <Rb_Input
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  px-3
                  text-sm
                  text-gray-700
                "
                placeholder="City"
                disabled={isSaving}
                {...register("city", {
                  required:
                    "City is required",
                })}
              />

              {errors.city && (
                <p className="text-xs text-red-600">
                  {errors.city.message}
                </p>
              )}
            </div>


            <div className="flex min-w-0 flex-col gap-1">
              <Rb_Label
                required
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-700
                "
              >
                State
              </Rb_Label>

              <Rb_Input
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  px-3
                  text-sm
                  text-gray-700
                "
                placeholder="State"
                disabled={isSaving}
                {...register("state", {
                  required:
                    "State is required",
                })}
              />

              {errors.state && (
                <p className="text-xs text-red-600">
                  {errors.state.message}
                </p>
              )}
            </div>


            <div className="flex min-w-0 flex-col gap-1">
              <Rb_Label
                required
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-700
                "
              >
                Zip Code
              </Rb_Label>

              <Rb_Input
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  px-3
                  text-sm
                  text-gray-700
                "
                placeholder="Zip Code"
                disabled={isSaving}
                {...register("zipCode", {
                  required:
                    "Zip Code is required",
                })}
              />

              {errors.zipCode && (
                <p className="text-xs text-red-600">
                  {errors.zipCode.message}
                </p>
              )}
            </div>


            <div className="flex min-w-0 flex-col gap-1">
              <Rb_Label
                required
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-700
                "
              >
                Country
              </Rb_Label>

              <Rb_Input
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  px-3
                  text-sm
                  text-gray-700
                "
                placeholder="Country"
                disabled={isSaving}
                {...register("country", {
                  required:
                    "Country is required",
                })}
              />

              {errors.country && (
                <p className="text-xs text-red-600">
                  {errors.country.message}
                </p>
              )}
            </div>


            <div
              className="
                md:col-span-2
                pt-1
              "
            >
              <label
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-3
                  rounded-lg
                  border
                  border-gray-200
                  bg-gray-50
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-gray-700
                  transition
                  hover:bg-gray-100
                  has-[:disabled]:cursor-not-allowed
                  has-[:disabled]:opacity-60
                "
              >
                <input
                  type="checkbox"
                  disabled={isSaving}
                  {...register("isDefault")}
                  className="
                    h-4
                    w-4
                    shrink-0
                    accent-violet-700
                  "
                />

                <span>
                  Set as Default Address
                </span>
              </label>
            </div>

          </div>


          {saveError && (
            <div
              className="
                mt-5
                rounded-lg
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-600
              "
            >
              {saveError}
            </div>
          )}
        </form>

        <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
          <div className="flex justify-end gap-3">
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
              {address ? "Update Address" : "Save Address"}
            </Rb_Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddressModal;