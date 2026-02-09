import React, { useState } from "react";
import { AiOutlinePlus, AiOutlineDelete, AiOutlineClose } from "react-icons/ai";
import { FiSettings } from "react-icons/fi";

const ProductAttributesForm = ({ attributes = [], onChange }) => {
  const [localAttributes, setLocalAttributes] = useState(
    attributes.length > 0
      ? attributes
      : [
          {
            name: "",
            values: [{ value: "", price: "" }],
            type: "text",
            hasPriceVariation: false,
          },
        ]
  );

  const attributeTypes = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "color", label: "Color" },
    { value: "size", label: "Size" },
    { value: "boolean", label: "Yes/No" },
    { value: "other", label: "Other" },
  ];

  const addAttribute = () => {
    const newAttributes = [
      ...localAttributes,
      {
        name: "",
        values: [{ value: "", price: "" }],
        type: "text",
        hasPriceVariation: false,
      },
    ];
    setLocalAttributes(newAttributes);
    onChange(newAttributes);
  };

  const removeAttribute = (index) => {
    const newAttributes = localAttributes.filter((_, i) => i !== index);
    setLocalAttributes(newAttributes);
    onChange(newAttributes);
  };

  const updateAttribute = (index, field, value) => {
    const newAttributes = localAttributes.map((attr, i) => {
      if (i === index) {
        return {
          ...attr,
          [field]: value,
        };
      }
      return attr;
    });
    setLocalAttributes(newAttributes);
    onChange(newAttributes);
  };

  const addValue = (attributeIndex) => {
    const newAttributes = localAttributes.map((attr, index) => {
      if (index === attributeIndex) {
        return {
          ...attr,
          values: [...attr.values, { value: "", price: "" }],
        };
      }
      return attr;
    });
    setLocalAttributes(newAttributes);
    onChange(newAttributes);
  };

  const removeValue = (attributeIndex, valueIndex) => {
    const newAttributes = localAttributes.map((attr, index) => {
      if (index === attributeIndex && attr.values.length > 1) {
        return {
          ...attr,
          values: attr.values.filter((_, i) => i !== valueIndex),
        };
      }
      return attr;
    });
    setLocalAttributes(newAttributes);
    onChange(newAttributes);
  };

  const updateValue = (attributeIndex, valueIndex, field, value) => {
    const newAttributes = localAttributes.map((attr, index) => {
      if (index === attributeIndex) {
        return {
          ...attr,
          values: attr.values.map((val, vIndex) => {
            if (vIndex === valueIndex) {
              return {
                ...val,
                [field]: value,
              };
            }
            return val;
          }),
        };
      }
      return attr;
    });
    setLocalAttributes(newAttributes);
    onChange(newAttributes);
  };

  const togglePriceVariation = (attributeIndex) => {
    const newAttributes = localAttributes.map((attr, index) => {
      if (index === attributeIndex) {
        const newHasPriceVariation = !attr.hasPriceVariation;
        return {
          ...attr,
          hasPriceVariation: newHasPriceVariation,
          values: newHasPriceVariation
            ? attr.values
            : attr.values.map((val) => ({ ...val, price: "" })),
        };
      }
      return attr;
    });
    setLocalAttributes(newAttributes);
    onChange(newAttributes);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="border-b border-gray-200/50 pb-3 md:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <FiSettings className="text-white" size={16} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                Product Attributes
              </h2>
              <p className="text-xs md:text-sm text-gray-600">
                Add specifications like color, size, etc.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={addAttribute}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <AiOutlinePlus size={16} />
            Add Attribute
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {localAttributes.map((attribute, index) => (
          <div
            key={index}
            className="p-3 md:p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-200/50 shadow-sm"
          >
            {/* Mobile: Stacked Layout, Desktop: Horizontal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {/* Attribute Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Attribute Name
                </label>
                <input
                  type="text"
                  value={attribute.name}
                  onChange={(e) =>
                    updateAttribute(index, "name", e.target.value)
                  }
                  placeholder="e.g., Color, Size"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 text-sm"
                />
              </div>

              {/* Attribute Type */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Type
                </label>
                <select
                  value={attribute.type}
                  onChange={(e) =>
                    updateAttribute(index, "type", e.target.value)
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 text-sm"
                >
                  {attributeTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Variation Toggle */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Price Variation
                </label>
                <div className="flex items-center space-x-2 h-[42px]">
                  <input
                    type="checkbox"
                    id={`priceVariation-${index}`}
                    checked={attribute.hasPriceVariation || false}
                    onChange={() => togglePriceVariation(index)}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`priceVariation-${index}`}
                    className="text-sm text-gray-600"
                  >
                    Different prices
                  </label>
                </div>
              </div>

              {/* Remove Button - Mobile: Full width at bottom, Desktop: Right aligned */}
              <div className="flex items-end justify-end">
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  className="w-full md:w-auto px-4 py-2.5 text-red-600 hover:text-white bg-red-50 hover:bg-red-500 border border-red-200 hover:border-red-500 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                  title="Remove attribute"
                >
                  <AiOutlineDelete size={16} />
                  <span className="md:hidden">Remove Attribute</span>
                </button>
              </div>
            </div>

            {/* Attribute Values Section */}
            <div className="mt-4 pt-4 border-t border-gray-200/50">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Values{" "}
                  {attribute.hasPriceVariation && (
                    <span className="text-blue-600">(with prices)</span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => addValue(index)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 font-medium"
                >
                  <AiOutlinePlus size={14} />
                  Add Value
                </button>
              </div>
              <div className="space-y-2">
                {attribute.values?.map((valueObj, valueIndex) => {
                  const value =
                    typeof valueObj === "string" ? valueObj : valueObj.value;
                  const price =
                    typeof valueObj === "object" ? valueObj.price : "";

                  return (
                    <div
                      key={valueIndex}
                      className="flex flex-col sm:flex-row gap-2"
                    >
                      <div className="flex-1 flex gap-2">
                        {attribute.type === "color" ? (
                          <>
                            <input
                              type="color"
                              value={value || "#000000"}
                              onChange={(e) =>
                                updateValue(
                                  index,
                                  valueIndex,
                                  "value",
                                  e.target.value
                                )
                              }
                              className="w-12 h-[42px] border border-gray-300 rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) =>
                                updateValue(
                                  index,
                                  valueIndex,
                                  "value",
                                  e.target.value
                                )
                              }
                              placeholder="Color name or hex"
                              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                            />
                          </>
                        ) : attribute.type === "boolean" ? (
                          <select
                            value={value}
                            onChange={(e) =>
                              updateValue(
                                index,
                                valueIndex,
                                "value",
                                e.target.value
                              )
                            }
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                          >
                            <option value="">Select...</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        ) : attribute.type === "number" ? (
                          <input
                            type="number"
                            value={value}
                            onChange={(e) =>
                              updateValue(
                                index,
                                valueIndex,
                                "value",
                                e.target.value
                              )
                            }
                            placeholder="Enter number"
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                          />
                        ) : (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) =>
                              updateValue(
                                index,
                                valueIndex,
                                "value",
                                e.target.value
                              )
                            }
                            placeholder={
                              attribute.type === "size"
                                ? "e.g., Small, Medium, Large"
                                : "Enter value"
                            }
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                          />
                        )}
                      </div>

                      {/* Price Input and Remove Button Container */}
                      <div className="flex gap-2">
                        {/* Price Input (only if price variation is enabled) */}
                        {attribute.hasPriceVariation && (
                          <input
                            type="number"
                            value={price}
                            onChange={(e) =>
                              updateValue(
                                index,
                                valueIndex,
                                "price",
                                e.target.value
                              )
                            }
                            placeholder="Price $"
                            className="w-full sm:w-28 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                          />
                        )}

                        {attribute.values.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeValue(index, valueIndex)}
                            className="text-red-600 hover:text-white hover:bg-red-500 p-2.5 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-500 flex-shrink-0"
                            title="Remove value"
                          >
                            <AiOutlineClose size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {localAttributes.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <FiSettings className="mx-auto mb-3 text-gray-400" size={32} />
            <p className="font-medium">No attributes added yet.</p>
            <p className="text-sm mt-1">
              Click "Add Attribute" to start adding product specifications.
            </p>
          </div>
        )}
      </div>

      {/* Examples */}
      <div className="mt-4 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          💡 Examples of attributes:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm text-blue-700">
          <div>
            <div className="font-medium">Without price variation:</div>
            <div className="ml-2">• Color: Red, Blue, Green</div>
            <div className="ml-2">• Material: Cotton, Polyester</div>
          </div>
          <div>
            <div className="font-medium">With price variation:</div>
            <div className="ml-2">• RAM: 4GB ($150), 8GB ($180)</div>
            <div className="ml-2">• Storage: 128GB ($200), 256GB ($250)</div>
          </div>
        </div>
        <div className="mt-2 text-xs text-blue-600">
          Enable "Different prices" to set custom prices for each attribute
          value
        </div>
      </div>
    </div>
  );
};

export default ProductAttributesForm;
