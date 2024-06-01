import React from "react";
import { Controller } from "react-hook-form";
import { twMerge } from "tailwind-merge";

interface IProps {
  name: string;
  label: string;
  control: any;
  disabled?: boolean;
  changeHandler?: (data: string | number) => void;
  rows?: number;
  resize?: boolean;
  showLabel?: boolean;
  className?: string;
  disableDoubleQuotes?: boolean;
}

const defaultProps = {
  disabled: false,
  changeHandler: () => {},
  rows: 2,
  resize: false,
  showLabel: true,
  className: "",
  disableDoubleQuotes: false,
};

function TextArea(props: IProps) {
  const {
    name,
    label,
    control,
    disabled,
    changeHandler,
    rows,
    resize,
    showLabel,
    className,
    disableDoubleQuotes,
  } = props;
  const resizeClass = resize ? "" : "resize-none";
  const disabledClass = disabled
    ? "bg-gray-200 dark:bg-gray-500 dark:text-gray-300"
    : "";
  return showLabel ? (
    <Controller
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <label
            htmlFor={name}
            className="block text-sm font-normal text-gray-900 dark:text-gray-300"
          >
            {label}
            <textarea
              id={name}
              rows={rows}
              value={value}
              disabled={disabled}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                let currValue = e.target.value;
                if (currValue && currValue.length > 0 && disableDoubleQuotes) {
                  currValue = currValue.replace('"', "'");
                }
                if (/(<([^>]+)>)/gi.test(currValue)) {
                  currValue = currValue.replace(/(<([^>]+)>)/gi, "");
                }
                if (/['{}<>|=]/.test(currValue)) {
                  currValue = currValue.replace(/['{}<>|=]/, "");
                }

                onChange(currValue);

                if (changeHandler) {
                  changeHandler(currValue);
                }
              }}
              className={twMerge(
                `${resizeClass} bg-gray-50 border border-gray-300 mt-2 outline-none focus:border-blue-900 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-gray-400 ${disabledClass} ${className}`,
              )}
            />
          </label>
          {error && error.message && (
            <p className="mt-2 text-sm text-red-500 dark:text-red-300">
              {error.message}
            </p>
          )}
        </>
      )}
      name={name}
      control={control}
    />
  ) : (
    <Controller
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          {label}
          <textarea
            id={name}
            rows={rows}
            value={value}
            disabled={disabled}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              let currValue = e.target.value;
              if (currValue && currValue.length > 0) {
                currValue = currValue.replace('"', "'");
              }
              if (/(<([^>]+)>)/gi.test(currValue)) {
                currValue = currValue.replace(/(<([^>]+)>)/gi, "");
              }
              if (/['{}<>|=]/.test(currValue)) {
                currValue = currValue.replace(/['{}<>|=]/, "");
              }
              onChange(currValue);

              if (changeHandler) {
                changeHandler(currValue);
              }
            }}
            className={twMerge(
              `${resizeClass} bg-gray-50 border border-gray-300 mt-2 outline-none focus:border-blue-900 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-gray-400 ${disabledClass} ${className}`,
            )}
          />

          {error && error.message && (
            <p className="mt-2 text-sm text-red-500 dark:text-red-300">
              {error.message}
            </p>
          )}
        </>
      )}
      name={name}
      control={control}
    />
  );
}

TextArea.defaultProps = defaultProps;
export default TextArea;
