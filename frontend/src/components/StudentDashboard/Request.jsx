import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import Notification from "../ProfessorDashboard/Notification";

const Request = () => {
  const [activeTab, setActiveTab] = useState("request"); // "request", "resolved", "unresolved"
  const [selectedIssuetitle, setSelectedIssuetitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [unresolvedIssues, setUnresolvedIssues] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  // For toggling resolved issue comments; key format: `${issue._id}-${index}`
  const [expandedComments, setExpandedComments] = useState({});

  const availableIssues = [
    "Eligibility Issue",
    "Application Form Issue",
    "Login/Signup Issue",
    "Profile Issue",
    "Other",
  ];

  useEffect(() => {
    fetchUserIssues();
  }, []);

  const fetchUserIssues = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/reqhelp/get-own-issue`,
        { withCredentials: true }
      );
      setResolvedIssues(response.data.resolved || []);
      setUnresolvedIssues(response.data.unresolved || []);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  const raiseIssue = async () => {
    if (!selectedIssuetitle || !issueDescription) {
      alert("Please select an issue and provide a description before raising it.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/reqhelp/create`,
        {
          title: selectedIssuetitle,
          description: issueDescription,
        },
        { withCredentials: true }
      );
      // Append the new issue to the unresolved list
      setUnresolvedIssues([...unresolvedIssues, response.data.data]);
      setAlertMessage("Your issue has been raised and sent to the team.");
      setIssueDescription("");
      setSelectedIssuetitle("");
      setTimeout(() => setAlertMessage(""), 3000);
    } catch (error) {
      console.error("Error raising issue:", error);
    }
  };

  // Toggle the display of the professor's comment
  const toggleComment = (key) => {
    setExpandedComments((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Render the issues by filtering the details array on the fly.
  const renderIssueList = (issues, filterStatus) => {
    return issues.length === 0 ? (
      <p className="text-sm text-gray-500">No issues found.</p>
    ) : (
      <ul className="space-y-3">
        {issues.map((issue) => {
          // Although the backend filtered details, do an extra filter in case there are extra entries.
          const filteredDetails = issue.details.filter(
            (detail) => detail.status === filterStatus
          );
          if (filteredDetails.length === 0) return null;
          return (
            <li
              key={issue._id}
              className="p-4 bg-gray-50 border rounded-md shadow-sm"
            >
              <div>
                <span className="font-medium text-gray-800">
                  {issue.title}
                </span>
                <ul className="mt-2 space-y-2">
                  {filteredDetails.map((detail, index) => (
                    <li
                      key={`${issue._id}-${index}`}
                      className="flex flex-col bg-white p-3 border rounded-md shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">
                            {detail.description || "No description provided."}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Raised on:{" "}
                            {new Date(detail.raisedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`flex items-center text-sm font-semibold py-1 px-3 rounded ${
                            detail.status === "Resolved"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {detail.status === "Resolved" ? (
                            <>
                              <FaCheckCircle className="mr-2" />
                              Resolved
                            </>
                          ) : (
                            <>
                              <FaExclamationCircle className="mr-2" />
                              Pending
                            </>
                          )}
                        </span>
                      </div>
                      {filterStatus === "Resolved" && (
                        <div className="mt-2">
                          <button
                            onClick={() =>
                              toggleComment(`${issue._id}-${index}`)
                            }
                            className="text-custom-blue text-sm focus:outline-none"
                          >
                            {expandedComments[`${issue._id}-${index}`]
                              ? "Hide Comment"
                              : "View Comment"}
                          </button>
                          {expandedComments[`${issue._id}-${index}`] && (
                            <p className="mt-1 text-sm text-gray-700">
                              {detail.comment || "No comment provided."}
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex">
        <div className="lg:w-9/12 hidden lg:block"></div>
        <div className="border border-gray-300 flex flex-row items-center justify-center mb-4 rounded-3xl bg-white">
          <button
            className={`px-4 py-2 rounded-3xl ${
              activeTab === "request"
                ? "bg-custom-blue text-white"
                : "bg-white"
            }`}
            onClick={() => setActiveTab("request")}
          >
            Request
          </button>
          <button
            className={`px-4 py-2 rounded-3xl ${
              activeTab === "resolved"
                ? "bg-custom-blue text-white"
                : "bg-white"
            }`}
            onClick={() => setActiveTab("resolved")}
          >
            Resolved
          </button>
          <button
            className={`px-4 py-2 rounded-3xl ${
              activeTab === "unresolved"
                ? "bg-custom-blue text-white"
                : "bg-white"
            }`}
            onClick={() => setActiveTab("unresolved")}
          >
            Pending
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto mt-0 bg-white rounded-lg shadow-lg p-6">
        {activeTab === "request" ? (
          <>
            <div className="p-4 rounded-t-lg text-center">
              <h1 className="font-bold text-black text-2xl sm:text-3xl lg:text-4xl tracking-wide">
                Request{" "}
                <span className="bg-custom-blue text-transparent bg-clip-text">
                  Help
                </span>
              </h1>
              <div className="flex sm:flex-row flex-col justify-center items-center">
                <span className="text-base text-black">Easily raise and</span>
                <span className="mx-1 bg-custom-blue text-transparent bg-clip-text text-center">
                  track your issues
                </span>
              </div>
            </div>
            {alertMessage && (
              <div className="p-4 mb-4 bg-green-100 text-green-800 rounded-md border-l-4 border-green-500">
                {alertMessage}
              </div>
            )}

            <label className="block text-gray-700 font-medium mb-2">
              Select an Issue
            </label>
            <select
              value={selectedIssuetitle}
              onChange={(e) => setSelectedIssuetitle(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="">Select an issue</option>
              {availableIssues.map((issue) => (
                <option key={issue} value={issue}>
                  {issue}
                </option>
              ))}
            </select>

            <label className="block text-gray-700 font-medium mb-2">
              Issue Description
            </label>
            <textarea
              onChange={(e) => setIssueDescription(e.target.value)}
              value={issueDescription}
              className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              rows="4"
              placeholder="Describe your issue here..."
            />

            <button
              onClick={raiseIssue}
              className="w-full bg-custom-blue text-white py-2 rounded-md hover:bg-blue-700 transition-shadow shadow-md"
            >
              Raise Issue
            </button>
          </>
        ) : (
          <div className="mt-2">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {activeTab === "resolved" ? "Resolved Issues" : "Pending Issues"}
            </h3>
            {activeTab === "resolved"
              ? renderIssueList(resolvedIssues, "Resolved")
              : renderIssueList(unresolvedIssues, "Pending")}
          </div>
        )}
      </div>
      <Notification />
    </div>
  );
};

export default Request;
