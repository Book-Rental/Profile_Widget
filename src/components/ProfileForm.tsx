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

const ProfileForm = ({ userId }: ProfileFormProps) => {
  const [isEdit, setIsEdit] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [profilePreview, setProfilePreview] =
    useState<string | null>(null);

  const [profileFile, setProfileFile] =
    useState<File | null>(null);

  const [isLoadingProfile, setIsLoadingProfile] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [saveError, setSaveError] =
    useState<string | null>(null);

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

      setProfilePreview(
        userData.profilePic || null
      );

      reset({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });
    } catch (err) {
      console.log(err);

      showToast(
        "Failed to load profile. Please try again.",
        "error"
      );
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
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
            profilePic:
              profilePreview || prev.profilePic,
          }
          : prev
      );

      setProfileFile(null);
      setIsEdit(false);

      showToast(
        "Profile updated successfully.",
        "success"
      );
    } catch (err) {
      console.log(err);

      const message =
        "Something went wrong while updating your profile. Please try again.";

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

    const first =
      user.firstName?.trim()?.charAt(0) || "";

    const last =
      user.lastName?.trim()?.charAt(0) || "";

    return `${first}${last}`.toUpperCase();
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_rgba(16,24,40,0.06)] sm:p-10">

      <div className="mb-7 flex items-center justify-between border-b border-gray-200 pb-5">

        <h2 className="text-[22px] font-bold text-gray-900">
          My Profile
        </h2>

        {!isEdit ? (
          <Rb_Button
            onClick={() => setIsEdit(true)}
            disabled={isLoadingProfile}
          >
            Edit
          </Rb_Button>
        ) : (
          <div className="flex gap-3">

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
                <span className="inline-flex items-center gap-2">

                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                  {profileFile
                    ? "Uploading..."
                    : "Updating..."}

                </span>
              ) : (
                "Update"
              )}
            </Rb_Button>

          </div>
        )}
      </div>

      <div className="mb-8 flex items-center gap-5 rounded-xl border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 px-5 py-4">

        <div className="group relative h-[68px] w-[68px] shrink-0">

          {profilePreview ? (
            <img
              src={profilePreview}
              alt="Profile"
              className={`h-[68px] w-[68px] rounded-full border-[3px] border-white object-cover shadow-md outline outline-1 outline-gray-200 ${isSaving && profileFile
                ? "brightness-50"
                : ""
                }`}
            />
          ) : (
            <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-indigo-100 to-indigo-200 text-2xl font-bold text-indigo-700 shadow-md outline outline-1 outline-gray-200">
              {getInitials()}
            </div>
          )}

          {isSaving && profileFile && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/40">

              <span className="h-5 w-5 animate-spin rounded-full border-[2.5px] border-white/40 border-t-white" />

              <span className="text-[9px] font-bold uppercase tracking-wider text-white">
                Uploading
              </span>

            </div>
          )}

          {isEdit && !isSaving && (
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">

              <input
                hidden
                type="file"
                accept="image/*"
                onChange={handleProfileChange}
              />

              Change

            </label>
          )}

        </div>

        <div className="min-w-0 flex-1">

          <h3 className="truncate text-base font-bold leading-6 text-gray-900">
            {user?.firstName} {user?.lastName}
          </h3>

          <p className="truncate text-xs leading-5 text-gray-500">
            {user?.email}
          </p>

          {isEdit && !isSaving && (
            <span className="mt-1 block text-xs font-medium text-violet-600">
              Click on the image to change profile photo
            </span>
          )}

          {isSaving && (
            <span className="mt-1 inline-flex items-center gap-2 text-xs font-medium text-violet-600">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-200 border-t-violet-600" />

              {profileFile
                ? "Uploading photo and saving changes..."
                : "Saving changes..."}
            </span>
          )}

        </div>

      </div>

      {saveError && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {saveError}
        </div>
      )}

      <div className="grid gap-5">

        <div className="flex flex-col gap-2">
          <Rb_Label required>Email</Rb_Label>

          <div className="[&>input]:h-11 [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-gray-200 [&>input]:bg-gray-50 [&>input]:px-3 [&>input]:text-gray-500  [&>input]:!cursor-not-allowed" >
            <Rb_Input
              disabled
              {...register("email")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

          <div className="flex flex-col gap-2">
            <Rb_Label required>
              First Name
            </Rb_Label>

            <div
              className={
                isEdit
                  ? "[&>input]:h-11 [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-gray-300 [&>input]:bg-white [&>input]:px-3 [&>input]:text-gray-900 [&>input]:outline-none [&>input]:transition [&>input]:focus:border-gray-400 [&>input]:focus:ring-1 [&>input]:focus:ring-gray-200 [&>input]:!cursor-text"
                  : "[&>input]:h-11 [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-gray-200 [&>input]:bg-gray-50 [&>input]:px-3 [&>input]:text-gray-500  [&>input]:!cursor-not-allowed"
              }
            >
              <Rb_Input
                disabled={!isEdit || isSaving}
                {...register("firstName")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Rb_Label required>
              Last Name
            </Rb_Label>

            <div
              className={
                isEdit
                  ? "[&>input]:h-11 [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-gray-300 [&>input]:bg-white [&>input]:px-3 [&>input]:text-gray-900 [&>input]:outline-none [&>input]:transition [&>input]:focus:border-gray-400 [&>input]:focus:ring-1 [&>input]:focus:ring-gray-200  [&>input]:!cursor-text"
                  : "[&>input]:h-11 [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-gray-200 [&>input]:bg-gray-50 [&>input]:px-3 [&>input]:text-gray-500  [&>input]:!cursor-not-allowed"
              }
            >
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