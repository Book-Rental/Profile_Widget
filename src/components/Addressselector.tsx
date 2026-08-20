import { useEffect, useState } from "react";
import { Rb_Button, Rb_LoadingSpinner } from "@rentbook/rentbook-ui-lib";

import {
  FaMapMarkerAlt,
  FaHome,
  FaBriefcase,
  FaPhoneAlt,
  FaPlus,
  FaRegCircle,
  FaDotCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

import AddressModal from "./AddressModal";

import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../services/userService";

import { Address } from "../types/user";
import { showToast } from "../utils/showToast";

interface AddressSelectorProps {
  userId: string;
  selectedAddressId?: string | null;
  onSelect?: (address: Address) => void;
  showActions?: boolean;
  showAddButton?: boolean;
  visibleCount?: number;
  layout?: "row" | "column";
}

const typeIcon = (type?: string) => {
  switch (type) {
    case "home":
      return <FaHome size={13} />;

    case "work":
      return <FaBriefcase size={13} />;

    default:
      return <FaMapMarkerAlt size={13} />;
  }
};

const sortWithDefaultFirst = (list: Address[]) =>
  [...list].sort((a, b) => {
    if (!!a.isDefault === !!b.isDefault) return 0;
    return a.isDefault ? -1 : 1;
  });

const AddressSelector = ({
  userId,
  selectedAddressId,
  onSelect,
  showActions = true,
  showAddButton = true,
  visibleCount = 4,
  layout = "row",
}: AddressSelectorProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAddressModal, setOpenAddressModal] = useState(false);

  const [selectedAddress, setSelectedAddress] =
    useState<Address | null>(null);

  const [settingDefaultId, setSettingDefaultId] =
    useState<string | null>(null);

  const [internalSelectedId, setInternalSelectedId] =
    useState<string | null>(null);

  const [expanded, setExpanded] = useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<Address | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const activeSelectedId =
    selectedAddressId !== undefined
      ? selectedAddressId
      : internalSelectedId;

  useEffect(() => {
    if (!userId) return;

    loadAddresses();
  }, [userId]);

  const loadAddresses = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const response = await getAddresses(userId);

      const sorted = sortWithDefaultFirst(response.data);

      setAddresses(sorted);

      if (
        selectedAddressId === undefined &&
        internalSelectedId === null
      ) {
        const defaultAddress = sorted.find(
          (address) => address.isDefault
        );

        if (defaultAddress?._id) {
          setInternalSelectedId(defaultAddress._id);
          onSelect?.(defaultAddress);
        }
      }

      return sorted;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const selectAddress = (address: Address) => {
    if (!address._id) return;

    if (selectedAddressId === undefined) {
      setInternalSelectedId(address._id);
    }

    onSelect?.(address);
  };

  const handleSelect = (address: Address) => {
    if (settingDefaultId) return;
    selectAddress(address);
  };

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setOpenAddressModal(true);
  };

  const handleEditAddress = (
    e: React.MouseEvent,
    address: Address
  ) => {
    e.stopPropagation();
    setSelectedAddress(address);
    setOpenAddressModal(true);
  };

  const handleSaveAddress = async (
    address: Address
  ) => {
    try {
      let savedId = selectedAddress?._id ?? null;

      if (selectedAddress?._id) {
        await updateAddress(
          userId,
          selectedAddress._id,
          address
        );

        savedId = selectedAddress._id;
      } else {
        const created = await addAddress(
          userId,
          address
        );

        savedId = created?.data?._id ?? null;
      }

      const refreshed = await loadAddresses(true);

      const savedAddress = refreshed.find(
        (item) => item._id === savedId
      );

      if (savedAddress?.isDefault) {
        selectAddress(savedAddress);
      }

      setOpenAddressModal(false);
      setSelectedAddress(null);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleDeleteAddress = (
    e: React.MouseEvent,
    address: Address
  ) => {
    e.stopPropagation();
    setDeleteTarget(address);
  };

  const confirmDeleteAddress = async () => {
    if (!deleteTarget?._id) return;

    setIsDeleting(true);

    try {
      await deleteAddress(
        userId,
        deleteTarget._id
      );

      setAddresses((prev) =>
        prev.filter(
          (item) => item._id !== deleteTarget._id
        )
      );

      if (
        activeSelectedId === deleteTarget._id &&
        selectedAddressId === undefined
      ) {
        setInternalSelectedId(null);
      }

      showToast(
        "Address deleted successfully.",
        "success"
      );

      setDeleteTarget(null);

      await loadAddresses(true);
    } catch (error) {
      console.error(error);

      showToast(
        "Failed to delete address.",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async (
    e: React.MouseEvent,
    address: Address
  ) => {
    e.stopPropagation();

    if (
      !address._id ||
      address.isDefault ||
      settingDefaultId
    ) {
      return;
    }

    const addressId = address._id;

    const previousAddresses = addresses;
    const previousSelectedId =
      internalSelectedId;

    setSettingDefaultId(addressId);

    const optimisticAddresses =
      sortWithDefaultFirst(
        addresses.map((item) => ({
          ...item,
          isDefault:
            item._id === addressId,
        }))
      );

    setAddresses(optimisticAddresses);

    selectAddress({
      ...address,
      isDefault: true,
    });

    try {
      await updateAddress(
        userId,
        addressId,
        {
          ...address,
          isDefault: true,
        }
      );

      await loadAddresses(true);
    } catch (error) {
      console.error(error);

      setAddresses(previousAddresses);

      if (
        selectedAddressId === undefined
      ) {
        setInternalSelectedId(
          previousSelectedId
        );
      }
    } finally {
      setSettingDefaultId(null);
    }
  };

  const visibleAddresses = expanded
    ? addresses
    : addresses.slice(
      0,
      visibleCount
    );

  const hiddenCount =
    addresses.length -
    visibleAddresses.length;

  return (
    <>
      {/* <div className="w-full text-left"> */}
      <div className=" w-full text-left rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_rgba(16,24,40,0.06)] sm:p-10">

        {/* Header — always a row: title left, button right, on every screen size */}

        <div className="mb-4 flex flex-row items-center justify-between gap-3">
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-900">
              Select Address
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose the delivery address for this order.
            </p>
          </div>

          {showAddButton && addresses.length > 0 && (
            <button
              type="button"
              onClick={handleAddAddress}
              className="inline-flex flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-violet-600 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              <FaPlus size={12} />
              Add Address
            </button>
          )}
        </div>

        {/* Loading */}

        {loading ? (
          <div className="flex h-[320px] items-center justify-center">
            <Rb_LoadingSpinner />
          </div>
        ) : addresses.length === 0 ? (

          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-8 py-10 text-center">

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-700">
              <FaMapMarkerAlt size={26} />
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              No addresses added yet
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
              {showAddButton
                ? "Add your first address to continue with book rentals and deliveries."
                : "No saved addresses available."}
            </p>

            {showAddButton && (
              <button
                type="button"
                onClick={handleAddAddress}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                <FaPlus size={12} />
                Add Address
              </button>
            )}
          </div>

        ) : (
          <>
            {/* Address Grid */}

            <div
              className={`grid gap-3 ${layout === "column"
                ? "grid-cols-1"
                : "grid-cols-1 lg:grid-cols-2"
                }`}
            >
              {visibleAddresses.map((item, index) => {
                const isSelected =
                  !!item._id &&
                  item._id === activeSelectedId;

                const isSettingDefault =
                  !!item._id &&
                  item._id === settingDefaultId;

                const isBusy = !!settingDefaultId;

                return (
                  <div
                    key={item._id || index}
                    role="radio"
                    aria-checked={isSelected}
                    aria-busy={isSettingDefault}
                    tabIndex={isBusy ? -1 : 0}
                    onClick={() => handleSelect(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelect(item);
                      }
                    }}
                    className={`relative flex h-full min-h-[190px] flex-col cursor-pointer rounded-lg border bg-white p-5 text-left transition-all duration-200
  ${isSelected
                        ? "border-violet-600 ring-1 ring-violet-100 shadow-sm"
                        : "border-gray-200 hover:border-violet-300 hover:shadow-sm"
                      }`}
                  >
                    {isSettingDefault && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-sm">
                        <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-violet-200 border-t-violet-600" />
                      </div>
                    )}

                    <div className="flex flex-1 items-start gap-3">
                      <div className="pt-0.5">
                        {isSelected ? (
                          <FaDotCircle size={17} className="text-violet-600" />
                        ) : (
                          <FaRegCircle size={17} className="text-gray-300" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-600">
                              {typeIcon(item.type)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="truncate text-[15px] font-semibold text-gray-900">
                                {item.name || "Address"}
                              </h4>
                              <span className="text-xs capitalize text-gray-400">
                                {item.type}
                              </span>
                            </div>
                          </div>

                          {item.isDefault && (
                            <span className="flex-shrink-0 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
                              Default
                            </span>
                          )}
                        </div>

                        <div className="mt-4 space-y-1 text-sm leading-snug text-gray-600">
                          <p>{item.street}</p>
                          <p>
                            {item.city}, {item.state} · {item.country} - {item.zipCode}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-400">
                          <FaPhoneAlt size={11} />
                          <span>{item.phone}</span>
                        </div>
                      </div>
                    </div>

                    {showActions && (
                      <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-100 pt-4 pl-[29px] text-sm">
                        <button onClick={(e) => handleEditAddress(e, item)} className="font-medium text-blue-600 hover:underline">
                          Edit
                        </button>
                        <button onClick={(e) => handleDeleteAddress(e, item)} className="font-medium text-red-600 hover:underline">
                          Remove
                        </button>
                        {!item.isDefault && (
                          <button
                            disabled={isSettingDefault}
                            onClick={(e) => handleSetDefault(e, item)}
                            className="font-medium text-violet-600 hover:underline disabled:opacity-50"
                          >
                            {isSettingDefault ? "Setting..." : "Set Default"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Show More / Show Less */}

            {addresses.length > visibleCount && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => !prev)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-violet-300 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                >
                  {expanded ? (
                    <>
                      Show Less
                      <FaChevronUp size={12} />
                    </>
                  ) : (
                    <>
                      Show {hiddenCount} More
                      <FaChevronDown size={12} />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Delete Confirmation */}

            {deleteTarget && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                onClick={() =>
                  !isDeleting && setDeleteTarget(null)
                }
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-md rounded-2xl bg-white p-6 text-left shadow-2xl"
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    Delete Address?
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    Are you sure you want to permanently remove
                    <span className="font-semibold text-gray-900">
                      {" "}
                      {deleteTarget.name || "this address"}
                    </span>
                    ? This action cannot be undone.
                  </p>

                  <div className="mt-8 flex justify-end gap-3">

                    <Rb_Button
                      variant="outline"
                      disabled={isDeleting}
                      onClick={() =>
                        setDeleteTarget(null)
                      }
                    >
                      Cancel
                    </Rb_Button>

                    <Rb_Button
                      disabled={isDeleting}
                      onClick={confirmDeleteAddress}
                      className="!border-red-600 !bg-red-600 hover:!bg-red-700"
                    >
                      {isDeleting ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Deleting...
                        </span>
                      ) : (
                        "Delete"
                      )}
                    </Rb_Button>

                  </div>
                </div>
              </div>
            )}

          </>
        )}
      </div>

      <AddressModal
        isOpen={openAddressModal}
        address={selectedAddress}
        onClose={() => {
          setOpenAddressModal(false);
          setSelectedAddress(null);
        }}
        onSave={handleSaveAddress}
      />
    </>
  );

};

export default AddressSelector;