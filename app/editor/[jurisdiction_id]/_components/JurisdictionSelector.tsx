import { findJurisdictionsByName } from "@/services/JurisdictionGisService";
import { useCallback, useEffect, useState } from "react";
import AsyncSelect from "react-select/async";

interface Option {
  value: string;
  label: string;
}

export default function JurisdictionSelector({
  value,
  exclude,
  onChange,
  onBlur,
}: {
  value?: any;
  exclude?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
}) {
  const [defaultOptions, setDefaultOptions] = useState<Option[]>();

  const loadOptions = useCallback(
    async (inputValue: string) => {
      try {
        return await findJurisdictionsByName(inputValue, exclude);
      } catch {
        return [];
      }
    },
    [exclude]
  );

  useEffect(() => {
    const loadAll = async () => {
      try {
        const data = await findJurisdictionsByName("", exclude);
        setDefaultOptions(data);
      } catch {

      }
    }

    loadAll();
  }, [])

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions={defaultOptions}
      loadOptions={loadOptions}
      value={value}
      placeholder="Search for a jurisdiction"
      onChange={onChange}
      onBlur={onBlur}
      styles={{
        control: (base, state) => ({
          ...base,
          borderRadius: "0.25rem",
          border: "1px solid #d1d5db",
          paddingLeft: "0.25rem",
          paddingRight: "0.25rem",
          paddingTop: "0.25rem",
          paddingBottom: "0.25rem",
          backgroundColor: state.isDisabled ? "#f9fafb" : "white",
          boxShadow: state.isFocused ? "unset" : base.boxShadow
        }),
      }}
      noOptionsMessage={() => "No results found."}
    />
  );
}
