import "./ProfileForm.css";
import "./AddressList.css";

import { useEffect, useState } from "react";
import {
  Rb_Button,
} from "@rentbook/rentbook-ui-lib";
import {
  FaMapMarkerAlt,
  FaHome,
  FaBriefcase,
  FaPhoneAlt,
  FaPlus,
  FaCheckCircle,
} from "react-icons/fa";

import AddressModal from "./AddressModal";

import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../services/userService";

import { Address } from "../types/user";

interface AddressListProps {
  userId: string;
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

const AddressList = ({
  userId,
}: AddressListProps) => {
  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [openAddressModal, setOpenAddressModal] =
    useState(false);

  const [selectedAddress, setSelectedAddress] =
    useState<Address | null>(null);

  useEffect(() => {
    loadAddresses();
  }, [userId]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await getAddresses(userId);
      setAddresses(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setOpenAddressModal(true);
  };

  const handleEditAddress = (
    address: Address
  ) => {
    setSelectedAddress(address);
    setOpenAddressModal(true);
  };

  const handleSaveAddress = async (
    address: Address
  ) => {
    try {
      if (selectedAddress?._id) {
        await updateAddress(
          userId,
          selectedAddress._id,
          address
        );
      } else {
        await addAddress(
          userId,
          address
        );
      }

      await loadAddresses();

      setOpenAddressModal(false);

      setSelectedAddress(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteAddress = async (
    address: Address
  ) => {
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

      await loadAddresses();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="profile-card address-card-container">

        <div className="profile-header">

          <div>
            <h2 className="address-title">
              Addresses
            </h2>
            <p className="address-subtitle">
              Manage the addresses linked to your account
            </p>
          </div>

          {addresses.length > 0 && (
            <Rb_Button onClick={handleAddAddress}>
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

            <p>Add an address so we know where to reach you.</p>

            <Rb_Button onClick={handleAddAddress}>
              <FaPlus size={12} style={{ marginRight: 8 }} />
              Add Address
            </Rb_Button>

          </div>
        ) : (
          <div className="address-grid">

            {addresses.map(
              (item, index) => (
                <div
                  key={item._id || index}
                  className="address-card"
                >
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
                        <FaCheckCircle size={11} />
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

                  <div className="address-actions">

                    <Rb_Button
                      variant="outline"
                      onClick={() => handleEditAddress(item)}
                    >
                      Edit
                    </Rb_Button>

                    <Rb_Button
                      variant="outline"
                      className="address-delete-btn"
                      onClick={() => handleDeleteAddress(item)}
                    >
                      Delete
                    </Rb_Button>

                  </div>
                </div>
              )
            )}

          </div>
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

export default AddressList;