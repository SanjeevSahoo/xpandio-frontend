import React from "react";
import { twMerge } from "tailwind-merge";

interface IProps {
  value: any;
  type?: string;
  changeHandler?: (data: string | number) => void;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  ref?: React.RefObject<HTMLInputElement>;
}

const defaultProps = {
  type: "text",
  changeHandler: () => {},
  className: "",
  disabled: false,
  size: "md",
  placeholder: "",
  ref: null,
};

function InputText(props: IProps) {
  const {
    value,
    type,
    disabled,
    changeHandler,
    className,
    size,
    placeholder,
    ref,
  } = props;
  let sizeClass = "p-2 px-2.5 text-sm ";
  switch (size) {
    case "sm":
      sizeClass = "p-1 px-1.5 text-xs ";
      break;
    case "lg":
      sizeClass = "p-2 px-4 text-md ";
      break;
    default:
      sizeClass = "p-2 px-2.5 text-sm ";
  }
  return (
    <input
      ref={ref}
      type={type}
      value={value}
      disabled={disabled}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        let currValue = e.target.value;
        if (currValue && currValue.length > 0) {
          currValue = currValue.replace('"', "'");
        }
        if (type === "text" && /(<([^>]+)>)/gi.test(currValue)) {
          currValue = currValue.replace(/(<([^>]+)>)/gi, "");
        }
        if (type === "text" && /['{}<>|=]/.test(currValue)) {
          currValue = currValue.replace(/['{}<>|=]/, "");
        }

        if (changeHandler) {
          changeHandler(currValue);
        }
      }}
      placeholder={placeholder}
      className={twMerge(
        `bg-gray-50 border border-gray-300 outline-none focus:border-blue-900 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-gray-400 ${sizeClass}  ${className}`,
      )}
    />
  );
}

InputText.defaultProps = defaultProps;
export default InputText;
