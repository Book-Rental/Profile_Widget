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
    try {
      // If backend supports multipart/form-data, use FormData here
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

      setIsEdit(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancel = () => {
    if (!user) return;

    reset({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    setProfilePreview(user.profilePic || null);
    setProfileFile(null);
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
          <Rb_Button onClick={() => setIsEdit(true)}>
            Edit
          </Rb_Button>
        ) : (
          <div className="button-group">
            <Rb_Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Rb_Button>

            <Rb_Button
              onClick={handleSubmit(onSubmit)}
            >
              Update
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
        className="profile-picture"
      />
    ) : (
      <div className="profile-picture initials-avatar">
        {getInitials()}
      </div>
    )}

    {isEdit && (
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

    {isEdit && (
      <span className="change-photo-text">
        Click on the image to change profile photo
      </span>
    )}
  </div>
</div>

      <div className="profile-form">
        <div className="form-field full-width">
          <Rb_Label required>Email</Rb_Label>
          <div className={!isEdit ? "disabled-field" : ""}>
            <Rb_Input
              disabled={!isEdit}
              {...register("email")}
            />
          </div>
        </div>

        <div className="two-column">
          <div className="form-field">
            <Rb_Label required>First Name</Rb_Label>
            <div className={!isEdit ? "disabled-field" : ""}>
              <Rb_Input
                disabled={!isEdit}
                {...register("firstName")}
              />
            </div>
          </div>

          <div className="form-field">
            <Rb_Label required>Last Name</Rb_Label>
            <div className={!isEdit ? "disabled-field" : ""}>
              <Rb_Input
                disabled={!isEdit}
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