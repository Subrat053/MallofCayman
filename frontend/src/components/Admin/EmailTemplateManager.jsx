import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  FiMail,
  FiEdit3,
  FiEye,
  FiRefreshCw,
  FiSend,
  FiSave,
  FiSettings,
  FiCode,
  FiType,
  FiDroplet,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { HiOutlineMail, HiOutlineTemplate } from "react-icons/hi";
import styles from "../../styles/styles";
import Loader from "../Layout/Loader";

const EmailTemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showGlobalStyling, setShowGlobalStyling] = useState(false);
  const [expandedVariables, setExpandedVariables] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    subject: "",
    htmlBody: "",
    styling: {
      primaryColor: "#f97316",
      secondaryColor: "#1f2937",
      backgroundColor: "#f9fafb",
      fontFamily: "Arial, sans-serif",
      logoUrl: "",
      footerText: "© 2026 Mall of Cayman. All rights reserved.",
    },
  });

  // Global styling state
  const [globalStyling, setGlobalStyling] = useState({
    primaryColor: "#f97316",
    secondaryColor: "#1f2937",
    backgroundColor: "#f9fafb",
    fontFamily: "Arial, sans-serif",
    logoUrl: "",
    footerText: "© 2026 Mall of Cayman. All rights reserved.",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${server}/email-template/all`, {
        withCredentials: true,
      });

      // Auto-initialize templates if none exist
      if (!data.templates || data.templates.length === 0) {
        console.log("No templates found, initializing...");
        await initializeTemplates();
        return; // initializeTemplates will call fetchTemplates again
      }

      setTemplates(data.templates);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const initializeTemplates = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${server}/email-template/init-templates`,
        {},
        { withCredentials: true }
      );
      toast.success(data.message || "Templates initialized successfully!");
      fetchTemplates();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to initialize templates"
      );
      setLoading(false);
    }
  };

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setEditForm({
      subject: template.subject,
      htmlBody: template.htmlBody,
      styling: template.styling || globalStyling,
    });
    setEditMode(false);
    setPreviewMode(false);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    try {
      setSaving(true);
      const { data } = await axios.put(
        `${server}/email-template/${selectedTemplate.slug}`,
        editForm,
        { withCredentials: true }
      );
      toast.success("Template saved successfully");
      setSelectedTemplate(data.template);
      fetchTemplates();
      setEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!selectedTemplate) return;
    if (
      !window.confirm(
        "Are you sure you want to reset this template to default?"
      )
    )
      return;

    try {
      setSaving(true);
      const { data } = await axios.put(
        `${server}/email-template/${selectedTemplate.slug}/reset`,
        {},
        { withCredentials: true }
      );
      toast.success("Template reset to default");
      setSelectedTemplate(data.template);
      setEditForm({
        subject: data.template.subject,
        htmlBody: data.template.htmlBody,
        styling: data.template.styling,
      });
      fetchTemplates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset template");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!selectedTemplate) return;

    try {
      // Create sample variables for preview
      const sampleVariables = {};
      selectedTemplate.availableVariables?.forEach((v) => {
        const varName = v.variable.replace(/{{|}}/g, "");
        sampleVariables[varName] = `[Sample ${varName}]`;
      });

      // Add some realistic sample data
      sampleVariables.shopName = "Sample Shop";
      sampleVariables.userName = "John Doe";
      sampleVariables.sellerName = "Jane Seller";
      sampleVariables.email = "sample@example.com";
      sampleVariables.activationUrl =
        `${process.env.REACT_APP_WEBSITE_URL}/activate/sample-token`;
        // "https://www.mallofcayman.com/activate/sample-token";
      sampleVariables.resetUrl =
        `${process.env.REACT_APP_WEBSITE_URL}/reset/sample-token`;
        // "https://www.mallofcayman.com/reset/sample-token";
      sampleVariables.loginUrl = `${process.env.REACT_APP_WEBSITE_URL}/shop-login`;
      // sampleVariables.loginUrl = "https://www.mallofcayman.com/shop-login";
      sampleVariables.orderNumber = "ORD-12345";
      sampleVariables.orderTotal = "$99.99";
      sampleVariables.statusText = "Shipped";
      sampleVariables.rejectionReason = "Sample rejection reason";
      sampleVariables.supportEmail = "support@mallofcayman.com";

      const { data } = await axios.post(
        `${server}/email-template/${selectedTemplate.slug}/preview`,
        { variables: sampleVariables },
        { withCredentials: true }
      );
      setPreviewHtml(data.preview.html);
      setPreviewMode(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to generate preview"
      );
    }
  };

  const handleSendTest = async () => {
    if (!selectedTemplate || !testEmail) {
      toast.error("Please enter a test email address");
      return;
    }

    try {
      setSendingTest(true);

      // Create sample variables
      const sampleVariables = {};
      selectedTemplate.availableVariables?.forEach((v) => {
        const varName = v.variable.replace(/{{|}}/g, "");
        sampleVariables[varName] = `[Sample ${varName}]`;
      });
      sampleVariables.shopName = "Test Shop";
      sampleVariables.userName = "Test User";
      sampleVariables.activationUrl =
        `${process.env.REACT_APP_WEBSITE_URL}/activate/test`;
        // "https://www.mallofcayman.com/activate/test";
      sampleVariables.resetUrl = `${process.env.REACT_APP_WEBSITE_URL}/reset/test`;
      // sampleVariables.resetUrl = "https://www.mallofcayman.com/reset/test";
      sampleVariables.loginUrl = `${process.env.REACT_APP_WEBSITE_URL}/shop-login`;
      // sampleVariables.loginUrl = "https://www.mallofcayman.com/shop-login";

      await axios.post(
        `${server}/email-template/${selectedTemplate.slug}/test`,
        { testEmail, variables: sampleVariables },
        { withCredentials: true }
      );
      toast.success(`Test email sent to ${testEmail}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send test email");
    } finally {
      setSendingTest(false);
    }
  };

  const handleGlobalStylingUpdate = async () => {
    try {
      setSaving(true);
      await axios.put(
        `${server}/email-template/styling/global`,
        { styling: globalStyling },
        { withCredentials: true }
      );
      toast.success("Global styling updated for all templates");
      fetchTemplates();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update global styling"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full p-4 800px:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <HiOutlineMail className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl 800px:text-3xl font-bold text-gray-900">
                Email Templates
              </h1>
              <p className="text-gray-600">
                Customize email content and styling
              </p>
            </div>
          </div>
          <button
            onClick={initializeTemplates}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all duration-200 flex items-center gap-2"
          >
            <FiRefreshCw size={16} />
            Initialize Templates
          </button>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className={`${styles.card} p-8 text-center`}>
          <HiOutlineTemplate className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Templates Found
          </h3>
          <p className="text-gray-500 mb-4">
            Click "Initialize Templates" to set up default email templates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template List */}
          <div className="lg:col-span-1">
            <div className={`${styles.card} overflow-hidden`}>
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <HiOutlineTemplate />
                  Available Templates
                </h2>
              </div>
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template._id}
                    onClick={() => selectTemplate(template)}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                      selectedTemplate?._id === template._id
                        ? "bg-indigo-50 border-l-4 border-indigo-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {template.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {template.description}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          template.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Styling */}
            <div className={`${styles.card} mt-4 overflow-hidden`}>
              <div
                className="p-4 border-b border-gray-200 bg-gray-50 cursor-pointer flex items-center justify-between"
                onClick={() => setShowGlobalStyling(!showGlobalStyling)}
              >
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FiDroplet />
                  Global Styling
                </h2>
                {showGlobalStyling ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              {showGlobalStyling && (
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={globalStyling.primaryColor}
                        onChange={(e) =>
                          setGlobalStyling({
                            ...globalStyling,
                            primaryColor: e.target.value,
                          })
                        }
                        className="w-10 h-10 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={globalStyling.primaryColor}
                        onChange={(e) =>
                          setGlobalStyling({
                            ...globalStyling,
                            primaryColor: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={globalStyling.secondaryColor}
                        onChange={(e) =>
                          setGlobalStyling({
                            ...globalStyling,
                            secondaryColor: e.target.value,
                          })
                        }
                        className="w-10 h-10 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={globalStyling.secondaryColor}
                        onChange={(e) =>
                          setGlobalStyling({
                            ...globalStyling,
                            secondaryColor: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Footer Text
                    </label>
                    <input
                      type="text"
                      value={globalStyling.footerText}
                      onChange={(e) =>
                        setGlobalStyling({
                          ...globalStyling,
                          footerText: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <button
                    onClick={handleGlobalStylingUpdate}
                    disabled={saving}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    Apply to All Templates
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Template Editor / Preview */}
          <div className="lg:col-span-2">
            {selectedTemplate ? (
              <div className={`${styles.card} overflow-hidden`}>
                {/* Template Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {selectedTemplate.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedTemplate.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditMode(!editMode);
                          setPreviewMode(false);
                        }}
                        className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                          editMode
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        <FiEdit3 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={handlePreview}
                        className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                          previewMode
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        <FiEye size={16} />
                        Preview
                      </button>
                      <button
                        onClick={handleReset}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-all duration-200 flex items-center gap-2"
                      >
                        <FiRefreshCw size={16} />
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* Available Variables */}
                <div className="p-4 bg-yellow-50 border-b border-yellow-200">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedVariables(!expandedVariables)}
                  >
                    <div className="flex items-center gap-2 text-yellow-800">
                      <FiInfo size={16} />
                      <span className="font-medium text-sm">
                        Available Variables
                      </span>
                    </div>
                    {expandedVariables ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                  {expandedVariables && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedTemplate.availableVariables?.map((v, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                        >
                          <code className="bg-yellow-100 px-2 py-0.5 rounded text-yellow-900 font-mono text-xs">
                            {v.variable}
                          </code>
                          <span className="text-yellow-700">
                            {v.description}
                          </span>
                          {v.required && (
                            <span className="text-red-600 text-xs">
                              (Required)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-4">
                  {previewMode ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 border-b">
                        Email Preview
                      </div>
                      <iframe
                        srcDoc={previewHtml}
                        title="Email Preview"
                        className="w-full h-[500px] bg-white"
                      />
                    </div>
                  ) : editMode ? (
                    <div className="space-y-4">
                      {/* Subject */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject Line
                        </label>
                        <input
                          type="text"
                          value={editForm.subject}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              subject: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      {/* Styling */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Primary Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={editForm.styling.primaryColor}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  styling: {
                                    ...editForm.styling,
                                    primaryColor: e.target.value,
                                  },
                                })
                              }
                              className="w-10 h-10 rounded border cursor-pointer"
                            />
                            <input
                              type="text"
                              value={editForm.styling.primaryColor}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  styling: {
                                    ...editForm.styling,
                                    primaryColor: e.target.value,
                                  },
                                })
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Secondary Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={editForm.styling.secondaryColor}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  styling: {
                                    ...editForm.styling,
                                    secondaryColor: e.target.value,
                                  },
                                })
                              }
                              className="w-10 h-10 rounded border cursor-pointer"
                            />
                            <input
                              type="text"
                              value={editForm.styling.secondaryColor}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  styling: {
                                    ...editForm.styling,
                                    secondaryColor: e.target.value,
                                  },
                                })
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* HTML Body */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <FiCode size={14} />
                          HTML Body
                        </label>
                        <textarea
                          value={editForm.htmlBody}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              htmlBody: e.target.value,
                            })
                          }
                          rows={15}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          style={{ fontFamily: "monospace" }}
                        />
                      </div>

                      {/* Footer Text */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Footer Text
                        </label>
                        <input
                          type="text"
                          value={editForm.styling.footerText}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              styling: {
                                ...editForm.styling,
                                footerText: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setEditMode(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-all duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                        >
                          <FiSave size={16} />
                          {saving ? "Saving..." : "Save Template"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Subject Line
                        </h4>
                        <p className="text-gray-900">
                          {selectedTemplate.subject}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Template Status
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                            selectedTemplate.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {selectedTemplate.isActive ? (
                            <FiCheck size={14} />
                          ) : (
                            <FiX size={14} />
                          )}
                          {selectedTemplate.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Test Email */}
                {!editMode && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiSend size={14} />
                      Send Test Email
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <button
                        onClick={handleSendTest}
                        disabled={sendingTest || !testEmail}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                      >
                        <FiSend size={16} />
                        {sendingTest ? "Sending..." : "Send Test"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`${styles.card} p-8 text-center`}>
                <FiMail className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Template
                </h3>
                <p className="text-gray-500">
                  Choose a template from the list to view or edit it.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateManager;
