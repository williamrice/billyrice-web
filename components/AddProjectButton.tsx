"use client";

import Link from "next/link";
import React from "react";
import { Plus } from "lucide-react";

const AddProjectButton = () => {
  return (
    <Link
      className="admin-button"
      href="/admin/add-project"
    >
      <Plus className="size-4" /> Add project
    </Link>
  );
};

export default AddProjectButton;
