import React from "react";

const InputField = ({ label, type, name, value, onChange }) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
};

export default InputField;
