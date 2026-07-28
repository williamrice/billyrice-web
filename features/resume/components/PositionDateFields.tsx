"use client";

import { useId, useState } from "react";
import { formatDateInputValue } from "@/lib/utils/dates";

const inputClass = "admin-field";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600";

export function PositionDateFields({
  startDate,
  endDate,
}: {
  startDate?: Date;
  endDate?: Date | null;
}) {
  const checkboxId = useId();
  const [currentRole, setCurrentRole] = useState(endDate === null);

  return (
    <>
      <label>
        <span className={labelClass}>Start date</span>
        <input
          className={inputClass}
          name="startDate"
          type="date"
          defaultValue={startDate ? formatDateInputValue(startDate) : ""}
          required
        />
      </label>
      {!currentRole && (
        <label>
          <span className={labelClass}>End date</span>
          <input
            className={inputClass}
            name="endDate"
            type="date"
            defaultValue={endDate ? formatDateInputValue(endDate) : ""}
            required
          />
        </label>
      )}
      <label
        className="flex items-start gap-3 text-sm font-medium sm:col-span-2"
        htmlFor={checkboxId}
      >
        <input
          checked={currentRole}
          className="mt-0.5 size-4 accent-teal-700"
          id={checkboxId}
          name="currentRole"
          onChange={(event) => setCurrentRole(event.target.checked)}
          type="checkbox"
        />
        <span>
          I currently hold this role
          <span className="mt-1 block text-xs font-normal text-gray-500">
            Current roles display “Present” and appear before completed roles.
          </span>
        </span>
      </label>
    </>
  );
}
