import "./ProfileForm.css";
import "./AddressSelector.css";

import { useState } from "react";
import { useEffect } from "react";
import {
  Rb_Button,
} from "@rentbook/rentbook-ui-lib";
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
  FaStar,
} from "react-icons/fa";

import AddressModal from "./AddressModal";

import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../services/userService";

import { Address } from "../types/user";

interface AddressSelectorProps {
  userId: string;
  /** Currently selected address id (controlled). If omitted, component manages its own selection state. */
  selectedAddressId?: string | null;
  /** Called whenever the user picks an address via the radio control. */
  onSelect?: (address: Address) => void;
  /** Show the Edit/Remove/Set-as-default links on each card. Default: true. Set to false for a pure "view + pick" widget. */
  showActions?: boolean;
  /** Show the "Add Address" button in the header. Default: true. Set to false for a pure "view + pick" widget. */
  showAddButton?: boolean;
  /** How many addresses to show before collapsing behind a "Show more" button. Default: 4. */
  visibleCount?: number;
}

const typeIcon = (type?: string) => {
  switch (type) {
    case "work":
      return <FaBriefcase size={14} />;
    case "home":
      return <FaHome size={14} />;
    default:
      return <FaMapMarkerAlt size={14} />;
  }
};

// Default address always floats to the top; original order is
// otherwise preserved among the rest.
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
}: AddressSelectorProps) => {
  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [openAddressModal, setOpenAddressModal] =
    useState(false);

  const [selectedAddress, setSelectedAddress] =
    useState<Address | null>(null);

  const [settingDefaultId, setSettingDefaultId] =
    useState<string | null>(null);

  // Falls back to internal state if the parent doesn't control selection.
  const [internalSelectedId, setInternalSelectedId] =
    useState<string | null>(null);

  const [expanded, setExpanded] =
    useState(false);

  const activeSelectedId =
    selectedAddressId !== undefined
      ? selectedAddressId
      : internalSelectedId;

  useEffect(() => {
    loadAddresses();
  }, [userId]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await getAddresses(userId);
      const sorted = sortWithDefaultFirst(response.data);
      setAddresses(sorted);

      // Default to the address marked as default, if nothing is selected yet.
      if (
        selectedAddressId === undefined &&
        internalSelectedId === null
      ) {
        const defaultAddress = sorted.find(
          (a: Address) => a.isDefault
        );
        if (defaultAddress?._id) {
          setInternalSelectedId(defaultAddress._id);
        }
      }

      return sorted;
    } catch (err) {
      console.log(err);
      return [];
    } finally {
      setLoading(false);
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
    // Ignore clicks on other cards while a "set default" call is in flight,
    // so the selection can't drift out of sync with the pending request.
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
        // Adjust this line if your addAddress response shape differs
        // (e.g. created.data._id) — it just needs the new address's id.
        savedId = created?.data?._id ?? null;
      }

      const refreshed = await loadAddresses();

     
      const savedAddress = refreshed.find(
        (a: Address) => a._id === savedId
      );

      if (savedAddress?.isDefault) {
        selectAddress(savedAddress);
      }

      setOpenAddressModal(false);

      setSelectedAddress(null);
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  const handleDeleteAddress = async (
    e: React.MouseEvent,
    address: Address
  ) => {
    e.stopPropagation();

    if (!address._id) return;

    const confirmed =
      window.confirm(
        "Delete this address? This action cannot be undone."
      );

    if (!confirmed) return;

    try {
      await deleteAddress(
        userId,
        address._id
      );

      if (activeSelectedId === address._id) {
        if (selectedAddressId === undefined) {
          setInternalSelectedId(null);
        }
      }

      await loadAddresses();
    } catch (err) {
      console.log(err);
    }
  };

  const handleSetDefault = async (
    e: React.MouseEvent,
    address: Address
  ) => {
    e.stopPropagation();

    if (!address._id || address.isDefault || settingDefaultId) return;

    const addressId = address._id;

    // Snapshot so we can roll back cleanly if the request fails.
    const previousAddresses = addresses;
    const previousSelectedId = internalSelectedId;

    setSettingDefaultId(addressId);

    // Optimistic update: mark this card default, unmark the rest, re-sort,
    // and select it immediately. This is what actually fixes the radio
    // appearing "stuck" — before, the UI waited on a full reload+lookup
    // before the dot ever moved, so it looked unresponsive/disabled.
    const optimistic = sortWithDefaultFirst(
      addresses.map((a) => ({
        ...a,
        isDefault: a._id === addressId,
      }))
    );
    setAddresses(optimistic);
    selectAddress({ ...address, isDefault: true });

    try {
      // NOTE: this assumes the backend clears isDefault on the
      // user's other addresses when one is marked default. If it
      // doesn't, that "only one default" rule needs to move there.
      await updateAddress(
        userId,
        addressId,
        { ...address, isDefault: true }
      );

      await loadAddresses();
    } catch (err) {
      console.log(err);

      // Roll back the optimistic change on failure.
      setAddresses(previousAddresses);
      if (selectedAddressId === undefined) {
        setInternalSelectedId(previousSelectedId);
      }
    } finally {
      setSettingDefaultId(null);
    }
  };

  const visibleAddresses = expanded
    ? addresses
    : addresses.slice(0, visibleCount);

  const hiddenCount = addresses.length - visibleAddresses.length;

  return (
    <>
      <div className="profile-card address-select-container">

        <div className="address-header-row">

          <div>
            <h2 className="address-title">
              Select Address
            </h2>
            <p className="address-subtitle">
              Choose an address for this order
            </p>
          </div>

          {showAddButton && addresses.length > 0 && (
            <Rb_Button
              variant="outline"
              className="add-address-btn"
              onClick={handleAddAddress}
            >
              <FaPlus size={12} style={{ marginRight: 8 }} />
              Add Address
            </Rb_Button>
          )}

        </div>

        {loading ? (
          <div className="address-skeleton-grid">
            <div className="address-skeleton" />
            <div className="address-skeleton" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="empty-address">

            <div className="address-icon">
              <FaMapMarkerAlt size={22} />
            </div>

            <h3>No addresses added yet</h3>

            <p>
              {showAddButton
                ? "Add an address so we know where to reach you."
                : "No saved addresses found."}
            </p>

            {showAddButton && (
              <Rb_Button onClick={handleAddAddress}>
                <FaPlus size={12} style={{ marginRight: 8 }} />
                Add Address
              </Rb_Button>
            )}

          </div>
        ) : (
          <>
            <div className="address-select-grid">

              {visibleAddresses.map(
                (item, index) => {
                  const isSelected =
                    !!item._id && item._id === activeSelectedId;

                  const isSettingDefault =
                    !!item._id && item._id === settingDefaultId;

                  const isBusy = !!settingDefaultId;

                  return (
                    <div
                      key={item._id || index}
                      className={
                        "address-select-card" +
                        (isSelected ? " address-select-card--active" : "") +
                        (isSettingDefault ? " address-select-card--busy" : "")
                      }
                      onClick={() => handleSelect(item)}
                      role="radio"
                      aria-checked={isSelected}
                      aria-busy={isSettingDefault}
                      tabIndex={isBusy ? -1 : 0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelect(item);
                        }
                      }}
                    >
                      {isSettingDefault && (
                        <div className="address-card-loading-overlay">
                          <span className="card-spinner" />
                          <span className="address-card-loading-text">
                            Setting as default…
                          </span>
                        </div>
                      )}

                      <div className="address-select-radio">
                        {isSelected ? (
                          <FaDotCircle size={18} />
                        ) : (
                          <FaRegCircle size={18} />
                        )}
                      </div>

                      <div className="address-select-body">

                        <div className="address-header">

                          <div className="address-name-row">
                            <span className="address-type-icon">
                              {typeIcon(item.type)}
                            </span>

                            <div>
                              <h4>{item.name || "Address"}</h4>
                              <span className="address-type">
                                {item.type}
                              </span>
                            </div>
                          </div>

                          {item.isDefault && (
                            <span className="default-badge">
                              <FaStar size={10} />
                              Default
                            </span>
                          )}

                        </div>

                        <div className="address-details">
                          <p>{item.street}</p>
                          <p>{item.city}, {item.state}</p>
                          <p>{item.country} - {item.zipCode}</p>
                        </div>

                        <p className="address-phone">
                          <FaPhoneAlt size={11} />
                          {item.phone}
                        </p>

                        {showActions && (
                          <div className="address-links-row">
                            <button
                              type="button"
                              className="link-btn"
                              onClick={(e) => handleEditAddress(e, item)}
                            >
                              Edit
                            </button>

                            <span className="link-sep">|</span>

                            <button
                              type="button"
                              className="link-btn link-btn--danger"
                              onClick={(e) => handleDeleteAddress(e, item)}
                            >
                              Remove
                            </button>

                            {!item.isDefault && (
                              <>
                                <span className="link-sep">|</span>
                                <button
                                  type="button"
                                  className="link-btn"
                                  onClick={(e) => handleSetDefault(e, item)}
                                  disabled={isSettingDefault}
                                >
                                  {isSettingDefault ? (
                                    <>
                                      <span className="btn-spinner-sm" />
                                      Setting...
                                    </>
                                  ) : (
                                    "Set as Default"
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        )}

                      </div>
                    </div>
                  );
                }
              )}

            </div>

            {addresses.length > visibleCount && (
              <button
                type="button"
                className="show-more-btn"
                onClick={() => setExpanded((prev) => !prev)}
              >
                {expanded ? (
                  <>
                    Show less
                    <FaChevronUp size={11} />
                  </>
                ) : (
                  <>
                    Show {hiddenCount} more
                    <FaChevronDown size={11} />
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>

      <AddressModal
        isOpen={openAddressModal}
        onClose={() => {
          setOpenAddressModal(false);
          setSelectedAddress(null);
        }}
        onSave={handleSaveAddress}
        address={selectedAddress}
      />
    </>
  );
};

export default AddressSelector;