"use client";

import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  MouseEvent,
} from "react";
import {
  Settings,
  SlidersHorizontal,
  Globe,
  Tag,
  Type,
  MapPin,
  Smartphone,
  Image as ImageIcon,
  Star,
  CalendarDays,
  Percent,
  Copyright,
  Power,
  Save,
  Info,
  AlertTriangle,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";

// Interface for the System Settings data
interface SystemSettingsData {
  id: number | null;
  website_name: string;
  tag_line: string;
  short_name: string;
  address: string;
  mobile: string;
  logo_image: string;
  fav_image: string;
  days_of_week: string;
  point: number | string;
  vat_type: number | string;
  copyright: string;
  status: number;
}

// Initial state for the form
const initialSettings: SystemSettingsData = {
  id: 1,
  website_name: "",
  tag_line: "",
  short_name: "",
  address: "",
  mobile: "",
  logo_image: "",
  fav_image: "",
  days_of_week: "",
  point: "",
  vat_type: "",
  copyright: "",
  status: 1,
};

let fetchedInitialSettings: SystemSettingsData | null = null;

const numericFieldNames = new Set<string>(["point", "vat_type"]);

const SystemSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettingsData>(initialSettings);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [favFile, setFavFile] = useState<File | null>(null);

  useEffect(() => {
    setTimeout(() => {
      const serverFetchedSettings: SystemSettingsData = {
        id: 1,
        website_name: "My Awesome Site",
        tag_line: "The best place on the web!",
        short_name: "MAS",
        address: "123 Main St, Anytown, USA",
        mobile: "+1234567890",
        logo_image: "", // Replace with actual URL or leave empty for placeholder
        fav_image: "", // Replace with actual URL or leave empty for placeholder
        days_of_week: "Monday,Tuesday,Wednesday,Thursday,Friday",
        point: 10.5,
        vat_type: 1,
        copyright: `© ${new Date().getFullYear()} My Awesome Site. All rights reserved.`,
        status: 1,
      };
      fetchedInitialSettings = { ...serverFetchedSettings };
      setSettings(serverFetchedSettings);
    }, 1000);
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0];

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSettings((prevSettings) => ({
            ...prevSettings,
            [name]: reader.result as string,
          }));
          if (name === "logo_image") {
            setLogoFile(file);
          } else if (name === "fav_image") {
            setFavFile(file);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // If no file is selected (e.g., user clears the file input)
        // Revert to the initial fetched setting for that image or an empty string
        setSettings((prevSettings) => ({
          ...prevSettings,
          [name]:
            fetchedInitialSettings?.[name as keyof SystemSettingsData] || "",
        }));
        if (name === "logo_image") {
          setLogoFile(null);
        } else if (name === "fav_image") {
          setFavFile(null);
        }
      }
    } else {
      setSettings((prevSettings) => ({
        ...prevSettings,
        [name]:
          type === "checkbox"
            ? (e.target as HTMLInputElement).checked
              ? 1
              : 0
            : numericFieldNames.has(name)
            ? value === "" // Allow empty string for number-like inputs
              ? ""
              : parseFloat(value)
            : value,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    // Create a FormData object to simulate file uploads along with other data
    const formData = new FormData();

    // Append all settings to formData.
    // For file inputs, we'll append the File object if a new file was selected.
    // Otherwise, we might send the existing URL (settings.logo_image or settings.fav_image)
    // or handle it based on backend requirements.
    Object.entries(settings).forEach(([key, value]) => {
      if (key === "logo_image" && logoFile) {
        // If a new logo file is selected, append it
        formData.append("logo_image_file", logoFile);
      } else if (key === "fav_image" && favFile) {
        // If a new fav file is selected, append it
        formData.append("fav_image_file", favFile);
      } else if (key !== "logo_image" && key !== "fav_image") {
        // Append other string/number settings
        formData.append(key, String(value));
      } else {
        // If no new file was selected for logo/favicon, append the existing URL string
        formData.append(key, String(value));
      }
    });

    // If you only want to send the file if it's new, and not the dataURL:
    // This is a more typical approach for actual file uploads.
    // The handleChange function already updates settings.logo_image to a dataURL for preview.
    // The backend would typically handle either a file upload or a URL string.

    console.log("Submitting FormData (simulated):");
    for (const [key, value] of formData.entries()) {
      // For File objects, value will be the File object itself.
      // For other fields, it will be the string representation.
      console.log(key, value instanceof File ? value.name : value);
    }

    // Simulate API call
    setTimeout(() => {
      // Assuming the save is successful
      setSuccessMessage("Settings saved successfully! (Simulated)");
      setIsSaving(false);
      // After successful save, the `logoFile` and `favFile` states should be reset
      // as they represent new files to be uploaded. The `settings.logo_image` and
      // `settings.fav_image` would now hold the (potentially new) URLs from the server response.
      // For this simulation, we'll assume the server responds with the same data or new URLs
      // and we would re-fetch or update `fetchedInitialSettings` and `settings`.
      setLogoFile(null); // Reset file input state
      setFavFile(null); // Reset file input state

      // To reflect the "saved" state, update fetchedInitialSettings
      // This is important if the user clears a file input *after* saving
      // It should revert to the "saved" state, not the original pre-load state.
      fetchedInitialSettings = { ...settings };

      setTimeout(() => setSuccessMessage(null), 3000);
    }, 1500);
  };

  const handleLabelClick = (event: MouseEvent<HTMLLabelElement>) => {
    // Prevent the default behavior of the label click,
    // which is to focus the associated input.
    event.preventDefault();
    // You could add custom logic here if needed, for example,
    // manually focusing the input if a certain condition is met,
    // or doing something else entirely.
    // const inputId = event.currentTarget.htmlFor;
    // const inputElement = document.getElementById(inputId);
    // if (inputElement) {
    //   // inputElement.focus(); // Example: manually focus if you want to conditionally
    // }
  };

  const formFieldsConfig = [
    {
      name: "website_name",
      label: "Website Name",
      type: "text",
      icon: Globe,
      required: true,
      fullWidth: false,
    },
    {
      name: "tag_line",
      label: "Tag Line",
      type: "text",
      icon: Tag,
      fullWidth: false,
    },
    {
      name: "short_name",
      label: "Short Name",
      type: "text",
      icon: Type,
      fullWidth: false,
    },
    {
      name: "mobile",
      label: "Mobile",
      type: "tel",
      icon: Smartphone,
      fullWidth: false,
    },
    {
      name: "logo_image",
      label: "Logo Image",
      type: "file",
      icon: UploadCloud,
      fullWidth: false,
      accept: "image/*",
    },
    {
      name: "fav_image",
      label: "Favicon Image",
      type: "file",
      icon: UploadCloud,
      fullWidth: false,
      accept:
        "image/x-icon, image/png, image/svg+xml, image/jpeg, image/gif, image/webp",
    },
    {
      name: "days_of_week",
      label: "Days of Week (comma-separated)",
      type: "text",
      icon: CalendarDays,
      fullWidth: false,
    },
    {
      name: "point",
      label: "Point Value",
      type: "number",
      icon: SlidersHorizontal, // Consider a more appropriate icon like Star or CheckCircle
      step: "0.01",
      fullWidth: false,
    },
    {
      name: "vat_type",
      label: "VAT Type (Integer)", // Or "VAT Percentage" if it's a rate
      type: "number",
      icon: Percent,
      step: "1", // Or "0.01" if it can be a percentage
      fullWidth: false,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      icon: Power,
      options: [
        { value: 1, label: "Active" },
        { value: 0, label: "Inactive" },
      ],
      fullWidth: false,
    },
    {
      name: "address",
      label: "Address",
      type: "textarea",
      icon: MapPin,
      fullWidth: true,
    },
    {
      name: "copyright",
      label: "Copyright Text",
      type: "text",
      icon: Copyright,
      fullWidth: true,
    },
  ];

  return (
    <div className="w-full min-h-screen p-4 font-sans bg-slate-100 dark:bg-slate-900">
      <header className="flex items-center justify-start gap-3 mb-2">
        <div className="inline-flex items-center justify-center bg-sky-600 dark:bg-sky-500 text-white p-3 rounded-full shadow-lg">
          <Settings className="h-5 w-5" />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-xl">
          System Settings
        </h1>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg flex items-center md:col-span-2 shadow">
          <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg flex items-center md:col-span-2 shadow">
          <Info className="h-5 w-5 mr-3 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-800 shadow-xl rounded-xl p-6 border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8"
      >
        {formFieldsConfig.map((field) => (
          <div
            key={field.name}
            className={`flex flex-col ${
              field.fullWidth ? "md:col-span-2" : ""
            }`}
          >
            <label
              htmlFor={field.name}
              onClick={handleLabelClick} // Added onClick handler here
              className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center cursor-default" // Added cursor-default
            >
              <field.icon className="h-5 w-5 mr-2 text-sky-600 dark:text-sky-400 flex-shrink-0" />
              {field.label}
              {field.required &&
                // Check if the value is empty or (for numbers) if it's an empty string
                (settings[field.name as keyof SystemSettingsData] === "" ||
                  settings[field.name as keyof SystemSettingsData] === null ||
                  settings[field.name as keyof SystemSettingsData] ===
                    undefined) &&
                (field.type !== "file" || // For file, required means an initial file must be there or selected
                  !settings[field.name as keyof SystemSettingsData]) && (
                  <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                )}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                value={
                  settings[field.name as keyof SystemSettingsData] as string
                }
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 transition-all duration-150 shadow-sm hover:shadow-md text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700"
                placeholder={`Enter ${field.label.toLowerCase()}`}
                required={field.required}
              />
            ) : field.type === "select" ? (
              <select
                id={field.name}
                name={field.name}
                value={settings[field.name as keyof SystemSettingsData]}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 transition-all duration-150 shadow-sm hover:shadow-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                required={field.required}
              >
                {field.options?.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="dark:bg-slate-700 dark:text-slate-200"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "file" ? (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                // Do not set 'value' for file inputs, it's read-only and controlled by the browser
                onChange={handleChange}
                accept={field.accept}
                required={
                  // File input required logic might mean an initial file must exist or one must be selected
                  field.required &&
                  !settings[field.name as keyof SystemSettingsData] &&
                  !(name === "logo_image" ? logoFile : favFile)
                }
                className="w-full text-sm text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 transition-all duration-150 shadow-sm hover:shadow-md bg-white dark:bg-slate-700
                                  file:mr-4 file:py-2.5 file:px-4 file:border-0 file:text-sm file:font-semibold
                                  file:bg-sky-100 dark:file:bg-sky-700 file:text-sky-700 dark:file:text-sky-200 hover:file:bg-sky-200 dark:hover:file:bg-sky-600 file:rounded-l-md file:cursor-pointer"
              />
            ) : (
              <input
                type={field.type === "number" ? "text" : field.type}
                id={field.name}
                name={field.name}
                value={settings[field.name as keyof SystemSettingsData]}
                onChange={handleChange}
                step={field.type === "number" ? undefined : field.step}
                required={field.required}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 transition-all duration-150 shadow-sm hover:shadow-md text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700"
                placeholder={`Enter ${field.label.toLowerCase()}`}
                inputMode={field.type === "number" ? "decimal" : undefined}
              />
            )}
          </div>
        ))}

        {/* Image Previews Container */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          {/* Logo Preview */}
          <div className="flex flex-col items-center">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 self-start">
              Logo Preview:
            </p>
            {settings.logo_image ? (
              <Image
                src={settings.logo_image}
                alt="Logo Preview"
                className="max-h-32 h-auto w-auto object-contain rounded-lg border border-slate-300 dark:border-slate-600 shadow-md bg-slate-50 dark:bg-slate-700 p-2"
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/200x100/efefef/777777?text=Invalid+Logo`;
                  e.currentTarget.alt = "Invalid or missing logo";
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-32 w-full rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500">
                <ImageIcon className="h-8 w-8 mr-2" /> No Logo Selected
              </div>
            )}
          </div>

          {/* Favicon Preview */}
          <div className="flex flex-col items-center">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 self-start">
              Favicon Preview:
            </p>
            {settings.fav_image ? (
              <Image
                src={settings.fav_image}
                alt="Favicon Preview"
                className="max-h-16 h-auto w-auto object-contain rounded-md border border-slate-300 dark:border-slate-600 shadow-md bg-slate-50 dark:bg-slate-700 p-1"
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/32x32/efefef/777777?text=X`;
                  e.currentTarget.alt = "Invalid or missing favicon";
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-16 w-full rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500">
                <Star className="h-6 w-6 mr-2" /> No Favicon
              </div>
            )}
          </div>
        </div>

        {/* Save Button - Aligned to the right */}
        <div className="md:col-span-2 pt-8 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="w-auto flex items-center justify-center px-8 py-3 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving Settings...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettingsPage;
