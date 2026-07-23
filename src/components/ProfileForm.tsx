import "./ProfileForm.css";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Rb_Button,
  Rb_Input,
  Rb_Label,
} from "@rentbook/rentbook-ui-lib";

import {
  getUser,
  updateUser,
} from "../services/userService";

import { User } from "../types/user";
import { showToast } from "../utils/showToast";


interface ProfileFormProps {
  userId: string;
}

interface ProfileFormValues {
  email: string;
  firstName: string;
  lastName: string;
}

const ProfileForm = ({
  userId,
}: ProfileFormProps) => {
  const [isEdit, setIsEdit] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<ProfileFormValues>();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await getUser(userId);
      const userData = response.data;

      setUser(userData);
      setProfilePreview(userData.profilePic || null);

      reset({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });
    } catch (err) {
      console.log(err);
      showToast("Failed to load profile. Please try again.", "error");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (
    data: ProfileFormValues
  ) => {
    setSaveError(null);
    setIsSaving(true);

    try {
      await updateUser(userId, {
        ...data,
        profilePic: profileFile || undefined,
      });

      setUser((prev) =>
        prev
          ? {
            ...prev,
            ...data,
            profilePic: profilePreview || prev.profilePic,
          }
          : prev
      );

      setProfileFile(null);
      setIsEdit(false);

      showToast("Profile updated successfully.", "success");
    } catch (err) {
      console.log(err);
      const message = "Something went wrong while updating your profile. Please try again.";
      setSaveError(message);
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!user || isSaving) return;

    reset({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    setProfilePreview(user.profilePic || null);
    setProfileFile(null);
    setSaveError(null);
    setIsEdit(false);
  };

  const getInitials = () => {
    if (!user) return "";

    const first = user.firstName?.trim()?.charAt(0) || "";
    const last = user.lastName?.trim()?.charAt(0) || "";

    return `${first}${last}`.toUpperCase();
  };

  return (
    <div className="profile-card">
      <div className="profile-header">
        <h2 className="profile-title">My Profile</h2>

        {!isEdit ? (
          <Rb_Button onClick={() => setIsEdit(true)} disabled={isLoadingProfile}>
            Edit
          </Rb_Button>
        ) : (
          <div className="button-group">
            <Rb_Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Rb_Button>

            <Rb_Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="btn-loading-content">
                  <span className="btn-spinner" />
                  {profileFile ? "Uploading..." : "Updating..."}
                </span>
              ) : (
                "Update"
              )}
            </Rb_Button>
          </div>
        )}
      </div>

      <div className="profile-picture-section">
        <div className="profile-picture-wrapper">
          {profilePreview ? (
            <img
              src={profilePreview}
              alt="Profile"
              className={"profile-picture" + (isSaving && profileFile ? " profile-picture--uploading" : "")}
            />
          ) : (
            <div className="profile-picture initials-avatar">
              {getInitials()}
            </div>
          )}

          {isSaving && profileFile && (
            <div className="avatar-upload-overlay" aria-live="polite">
              <span className="avatar-spinner" />
              <span className="avatar-upload-text">Uploading</span>
            </div>
          )}

          {isEdit && !isSaving && (
            <label className="upload-overlay">
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleProfileChange}
              />
              Change
            </label>
          )}
        </div>

        <div className="profile-user-info">
          <h3>
            {user?.firstName} {user?.lastName}
          </h3>

          <p>{user?.email}</p>

          {isEdit && !isSaving && (
            <span className="change-photo-text">
              Click on the image to change profile photo
            </span>
          )}

          {isSaving && (
            <span className="saving-status-text">
              <span className="btn-spinner btn-spinner--muted" />
              {profileFile ? "Uploading photo and saving changes…" : "Saving changes…"}
            </span>
          )}
        </div>
      </div>

      {saveError && (
        <p className="profile-error-banner">{saveError}</p>
      )}

      <div className="profile-form">
        <div className="form-field full-width">
          <Rb_Label required>Email</Rb_Label>
          <div className="disabled-field">
            <Rb_Input
              disabled
              {...register("email")}
            />
          </div>
        </div>

        <div className="two-column">
          <div className="form-field">
            <Rb_Label required>First Name</Rb_Label>
            <div className={!isEdit ? "disabled-field" : ""}>
              <Rb_Input
                disabled={!isEdit || isSaving}
                {...register("firstName")}
              />
            </div>
          </div>

          <div className="form-field">
            <Rb_Label required>Last Name</Rb_Label>
            <div className={!isEdit ? "disabled-field" : ""}>
              <Rb_Input
                disabled={!isEdit || isSaving}
                {...register("lastName")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;