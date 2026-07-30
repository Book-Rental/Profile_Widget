import {
  render,
  screen,
  waitFor,
    fireEvent,
} from "@testing-library/react";
import type { UserResponse } from "../types/user";
import userEvent from "@testing-library/user-event";

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";

import type {
  ReactNode,
  ChangeEvent,
} from "react";

import type {
  User,
} from "../types/user";

import {
  getUser,
  updateUser,
} from "../services/userService";

import {
  showToast,
} from "../utils/showToast";

import ProfileForm from "../components/ProfileForm";


vi.mock("../services/userService", () => ({
  getUser: vi.fn(),
  updateUser: vi.fn(),
}));


vi.mock("../utils/showToast", () => ({
  showToast: vi.fn(),
}));


vi.mock("@rentbook/rentbook-ui-lib", async () => {

  const React = await import("react");


  type ButtonProps = {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
  };


  type InputProps = {
    id?: string;
    name?: string;
    disabled?: boolean;
    value?: string;
    onChange?: (
      e: ChangeEvent<HTMLInputElement>
    ) => void;
  };


  type LabelProps = {
    children: ReactNode;
    htmlFor?: string;
    required?: boolean;
  };


  return {

    Rb_Button: ({
      children,
      onClick,
      disabled,
      ...rest
    }: ButtonProps) => (
      <button
        onClick={onClick}
        disabled={disabled}
        {...rest}
      >
        {children}
      </button>
    ),


    Rb_Input:
      React.forwardRef<HTMLInputElement, InputProps>(
        (
          {
            id,
            name,
            ...props
          },
          ref
        ) => (
          <input
            ref={ref}
            id={id || name}
            name={name}
            {...props}
          />
        )
      ),


    Rb_Label: ({
      children,
      htmlFor,
      required,
    }: LabelProps) => (
      <label htmlFor={htmlFor}>
        {children}
        {required ? " *" : ""}
      </label>
    ),

  };

});



const mockUser: User = {
  _id: "user-1",
  email: "jane.doe@example.com",
  firstName: "Jane",
  lastName: "Doe",
  profilePic:
    "https://example.com/avatar.png",
  addresses: [],
};



const renderForm = (
  userId = "user-1"
) =>
  render(
    <ProfileForm userId={userId} />
  );



beforeEach(() => {

  vi.clearAllMocks();


  vi.mocked(getUser)
    .mockResolvedValue({
      data: mockUser,
      status: "",
      message: "",
    });


  vi.mocked(updateUser)
    .mockResolvedValue({
      data: mockUser,
      status: "",
      message: "",
    });


  globalThis.URL.createObjectURL =
    vi.fn(
      () =>
        "blob:mock-preview-url"
    );

});



describe("ProfileForm", () => {


  it("fetches profile on mount", async () => {

    renderForm();


    await waitFor(() =>
      expect(getUser)
        .toHaveBeenCalledWith(
          "user-1"
        )
    );

  });



  it("disables Edit button while loading", () => {

    vi.mocked(getUser)
      .mockReturnValue(
        new Promise(() => {})
      );


    renderForm();


    expect(
      screen.getByRole(
        "button",
        {
          name: "Edit",
        }
      )
    ).toBeDisabled();

  });



  it("renders user data after loading", async () => {

    renderForm();


    expect(
      await screen.findByText(
        "Jane Doe"
      )
    )
      .toBeInTheDocument();


    expect(
      screen.getByText(
        mockUser.email
      )
    )
      .toBeInTheDocument();

  });



 it("shows initials without profile picture", async () => {

  vi.mocked(getUser)
    .mockResolvedValue({
      data: {
        ...mockUser,
        profilePic: undefined,
      },
      status: "",
      message: "",
    });


  renderForm();


  expect(
    await screen.findByText("JD")
  )
    .toBeInTheDocument();

});



  it("shows error toast when loading fails", async () => {

    vi.mocked(getUser)
      .mockRejectedValue(
        new Error()
      );


    renderForm();


    await waitFor(() =>
      expect(showToast)
        .toHaveBeenCalledWith(
          "Failed to load profile. Please try again.",
          "error"
        )
    );

  });

  it("keeps email disabled in edit mode", async () => {

    const user = userEvent.setup();

    renderForm();


    await screen.findByText(
      "Jane Doe"
    );


    const email =
      screen.getByRole(
        "textbox",
        {
          name: /email/i,
        }
      );


    expect(email)
      .toBeDisabled();


    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Edit",
        }
      )
    );


    expect(email)
      .toBeDisabled();

  });



  it("enters edit mode and enables name fields", async () => {

    const user = userEvent.setup();


    renderForm();


    await screen.findByText(
      "Jane Doe"
    );


    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Edit",
        }
      )
    );


    const firstName =
      screen.getByRole(
        "textbox",
        {
          name: /first name/i,
        }
      );


    const lastName =
      screen.getByRole(
        "textbox",
        {
          name: /last name/i,
        }
      );


    expect(firstName)
      .toBeEnabled();


    expect(lastName)
      .toBeEnabled();


    expect(firstName)
      .toHaveValue(
        "Jane"
      );


    expect(lastName)
      .toHaveValue(
        "Doe"
      );


    expect(
      screen.getByRole(
        "button",
        {
          name: "Cancel",
        }
      )
    )
      .toBeInTheDocument();

  });



  it("cancels changes and restores values", async () => {

    const user = userEvent.setup();


    renderForm();


    await screen.findByText(
      "Jane Doe"
    );


    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Edit",
        }
      )
    );


    const firstName =
      screen.getByRole(
        "textbox",
        {
          name: /first name/i,
        }
      );


    await user.clear(
      firstName
    );


    await user.type(
      firstName,
      "Janet"
    );


    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Cancel",
        }
      )
    );


    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Edit",
        }
      )
    );


    expect(
      screen.getByRole(
        "textbox",
        {
          name: /first name/i,
        }
      )
    )
      .toHaveValue(
        "Jane"
      );

  });



  it("updates profile successfully", async () => {

    const user = userEvent.setup();


    renderForm();


    await screen.findByText(
      "Jane Doe"
    );


    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Edit",
        }
      )
    );


    const firstName =
      screen.getByRole(
        "textbox",
        {
          name: /first name/i,
        }
      );


    await user.clear(
      firstName
    );


    await user.type(
      firstName,
      "Janet"
    );


    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Update",
        }
      )
    );


    await waitFor(() =>
      expect(updateUser)
        .toHaveBeenCalledWith(
          "user-1",
          expect.objectContaining({
            firstName: "Janet",
            lastName: "Doe",
            email: mockUser.email,
          })
        )
    );


    expect(showToast)
      .toHaveBeenCalledWith(
        "Profile updated successfully.",
        "success"
      );

  });


it("shows saving state", async () => {
  const user = userEvent.setup();

  let resolveUpdate:
    ((value: UserResponse) => void) | undefined;


  vi.mocked(updateUser)
    .mockImplementation(
      () =>
        new Promise<UserResponse>(
          (resolve) => {
            resolveUpdate = resolve;
          }
        )
    );


  renderForm();


  await screen.findByText(
    "Jane Doe"
  );


  await user.click(
    screen.getByRole(
      "button",
      {
        name: "Edit",
      }
    )
  );


  await user.click(
    screen.getByRole(
      "button",
      {
        name: "Update",
      }
    )
  );


  expect(
    await screen.findByText(
      "Saving changes..."
    )
  )
    .toBeInTheDocument();


  resolveUpdate?.({
    data: mockUser,
    status: "",
    message: "",
  });
});



  it("shows update error", async () => {

    const user = userEvent.setup();


    vi.mocked(updateUser)
      .mockRejectedValue(
        new Error()
      );


    renderForm();


    await screen.findByText(
      "Jane Doe"
    );


    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Edit",
        }
      )
    );


    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Update",
        }
      )
    );


    expect(
      await screen.findByText(
        "Something went wrong while updating your profile. Please try again."
      )
    )
      .toBeInTheDocument();

  });



  it("updates avatar preview", async () => {

    const user = userEvent.setup();


    renderForm();


    await screen.findByText(
      "Jane Doe"
    );


    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Edit",
        }
      )
    );


    const file =
      new File(
        [
          "avatar",
        ],
        "avatar.png",
        {
          type: "image/png",
        }
      );


    const input =
      screen.getByLabelText(
        "Change"
      );


    fireEvent.change(
      input,
      {
        target: {
          files: [
            file,
          ],
        },
      }
    );


    await waitFor(() =>
      expect(
        screen.getByAltText(
          "Profile"
        )
      )
        .toHaveAttribute(
          "src",
          "blob:mock-preview-url"
        )
    );

  });



  it("does not show Change outside edit mode", async () => {

    renderForm();


    await screen.findByText(
      "Jane Doe"
    );


    expect(
      screen.queryByText(
        "Change"
      )
    )
      .not
      .toBeInTheDocument();

  });


});