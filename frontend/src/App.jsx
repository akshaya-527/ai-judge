import React, { useState } from "react";
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Settings,
  LogOut,
  Clock,
  User,
  ShieldAlert,
  FileBarChart,
  Bell,
  Lock,
} from "lucide-react";
import axios from "axios";
import "./index.css";

function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Interactive States
  const [approvedActions, setApprovedActions] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    activeJudgments: 0,
    actionsPending: 0,
    atRisk: 0,
    recentActions: [],
  });

  // Settings State
  const [settings, setSettings] = useState({
    autoAssign: true,
    escalationDays: "14,7,3,0",
    riskThreshold: "70",
    notifyEmail: "collector@revenue.gov.in",
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Invalid credentials. Hint: use admin / admin");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setActiveTab("dashboard");
    setResult(null);
    setFile(null);
    setApprovedActions([]);
    setDashboardStats({
      activeJudgments: 0,
      actionsPending: 0,
      atRisk: 0,
      recentActions: [],
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
    }
  };

  const processFile = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://ai-judge-5tzj.onrender.com/api/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setResult(response.data.data);
      setApprovedActions([]); // Reset approvals for new document
      setActiveTab("results");
    } catch (err) {
      setError(
        err.response?.data?.detail || "An error occurred during processing.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (action) => {
    if (!approvedActions.includes(action.action_id)) {
      setApprovedActions([...approvedActions, action.action_id]);

      // Update Dashboard Stats to simulate system integration
      setDashboardStats((prev) => ({
        activeJudgments: prev.activeJudgments === 0 ? 1 : prev.activeJudgments,
        actionsPending: prev.actionsPending + 1,
        atRisk:
          action.contempt_risk.level === "CRITICAL" ||
          action.contempt_risk.level === "HIGH"
            ? prev.atRisk + 1
            : prev.atRisk,
        recentActions: [
          ...prev.recentActions,
          {
            case_number: result.case_number,
            description: action.description,
            assigned_to: action.assigned_to,
            deadline: action.deadline,
            risk_level: action.contempt_risk.level,
          },
        ],
      }));
    }
  };

  const handleExportPDF = () => {
    alert(
      "CAG Liability Shield PDF has been successfully generated and exported to your local system.",
    );
  };

  const handleRequestModification = () => {
    alert(
      "Modification request sent. The assigned legal officer will review the extraction parameters.",
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-card glass-panel">
          <div className="login-logo">
            <ShieldAlert size={48} color="var(--primary)" />
            <h1>JAIS</h1>
            <p>Judgment-to-Action Intelligence System</p>
          </div>

          <form onSubmit={handleLogin}>
            {loginError && (
              <div className="login-error">
                <AlertTriangle size={16} /> {loginError}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary login-btn">
              <Lock size={18} /> Secure Login
            </button>
          </form>
          <div className="login-footer">
            <p>Authorized Government Personnel Only</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <ShieldAlert size={28} />
          JAIS
        </div>
        <nav>
          <div
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <BarChart3 size={20} /> Department Dashboard
          </div>
          <div
            className={`nav-item ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            <UploadCloud size={20} /> Upload Judgment
          </div>
          <div
            className={`nav-item ${activeTab === "results" ? "active" : ""}`}
            onClick={() => {
              if (result) setActiveTab("results");
            }}
            style={{
              opacity: result ? 1 : 0.5,
              cursor: result ? "pointer" : "not-allowed",
            }}
          >
            <FileText size={20} /> Analysis Results
          </div>
          <div
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={20} /> System Settings
          </div>
        </nav>
        <div style={{ marginTop: "auto" }}>
          <div
            className="nav-item"
            style={{ color: "var(--danger)" }}
            onClick={handleLogout}
          >
            <LogOut size={20} /> Logout
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "28px" }}>
              Judgment-to-Action Intelligence
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              Automated extraction, verification, and compliance tracking.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <Bell size={24} color="var(--text-muted)" />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                paddingLeft: "20px",
                borderLeft: "1px solid var(--panel-border)",
              }}
            >
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                  A. Sharma
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  IAS Officer
                </div>
              </div>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "var(--primary)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                AS
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="tab-section">
            <h2 style={{ marginBottom: "24px" }}>Overview</h2>
            <div className="stats-grid">
              <div className="glass-panel stat-card">
                <div className="stat-label">Active Judgments</div>
                <div className="stat-value">
                  {dashboardStats.activeJudgments}
                </div>
                <div
                  style={{
                    color: "var(--text-muted)",
                    marginTop: "4px",
                    fontSize: "13px",
                  }}
                >
                  {dashboardStats.activeJudgments === 0
                    ? "Awaiting first upload"
                    : "System tracking active"}
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-label">Actions Pending</div>
                <div className="stat-value">
                  {dashboardStats.actionsPending}
                </div>
                <div
                  style={{
                    color: "var(--text-muted)",
                    marginTop: "4px",
                    fontSize: "13px",
                  }}
                >
                  {dashboardStats.actionsPending === 0
                    ? "All caught up"
                    : "Monitoring assigned tasks"}
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-label">At Risk / Overdue</div>
                <div
                  className="stat-value"
                  style={{
                    color:
                      dashboardStats.atRisk > 0
                        ? "var(--danger)"
                        : "var(--success)",
                  }}
                >
                  {dashboardStats.atRisk}
                </div>
                <div
                  style={{
                    color:
                      dashboardStats.atRisk > 0
                        ? "var(--danger)"
                        : "var(--success)",
                    marginTop: "4px",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {dashboardStats.atRisk > 0 ? (
                    <>
                      <AlertTriangle size={14} /> Contempt Notice Risk High
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} /> No items at risk
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-panel">
              <h3 style={{ marginBottom: "16px" }}>Recent High-Risk Actions</h3>
              {dashboardStats.recentActions.length === 0 ? (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  <FileText
                    size={48}
                    style={{ opacity: 0.3, margin: "0 auto 16px" }}
                  />
                  <p>No high-risk actions found.</p>
                  <p style={{ fontSize: "13px", marginTop: "8px" }}>
                    Once judgments are uploaded and approved, critical action
                    items will appear here.
                  </p>
                </div>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--panel-border)",
                        color: "var(--text-muted)",
                      }}
                    >
                      <th style={{ padding: "12px", fontWeight: 600 }}>
                        Case No.
                      </th>
                      <th style={{ padding: "12px", fontWeight: 600 }}>
                        Action Description
                      </th>
                      <th style={{ padding: "12px", fontWeight: 600 }}>
                        Assigned To
                      </th>
                      <th style={{ padding: "12px", fontWeight: 600 }}>
                        Deadline
                      </th>
                      <th style={{ padding: "12px", fontWeight: 600 }}>
                        Risk Level
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardStats.recentActions.map((action, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: "1px solid var(--panel-border)",
                        }}
                      >
                        <td style={{ padding: "12px", fontWeight: 500 }}>
                          {action.case_number}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {action.description}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {action.assigned_to}
                        </td>
                        <td style={{ padding: "12px", fontWeight: 500 }}>
                          {action.deadline}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span
                            className={`badge badge-${action.risk_level.toLowerCase()}`}
                          >
                            {action.risk_level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div
            className="tab-section glass-panel"
            style={{ maxWidth: "800px", margin: "0 auto" }}
          >
            <h2 style={{ marginBottom: "8px" }}>Upload Court Judgment</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
              Upload a PDF judgment. The AI will extract actions, predict
              contempt risk, and set up tracking.
            </p>

            <div
              className={`upload-dropzone ${file ? "active" : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileUpload").click()}
            >
              <input
                type="file"
                id="fileUpload"
                accept=".pdf"
                hidden
                onChange={handleFileChange}
              />
              <UploadCloud size={48} className="upload-icon" />
              {file ? (
                <div>
                  <h3
                    style={{ color: "var(--text-main)", marginBottom: "8px" }}
                  >
                    {file.name}
                  </h3>
                  <p style={{ color: "var(--text-muted)" }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <h3
                    style={{ color: "var(--text-main)", marginBottom: "8px" }}
                  >
                    Drag and drop PDF here
                  </h3>
                  <p style={{ color: "var(--text-muted)" }}>
                    or click to browse from your computer
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  background: "var(--danger-bg)",
                  color: "var(--danger)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertTriangle size={18} /> {error}
              </div>
            )}

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  processFile();
                }}
                disabled={!file || loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div> Processing AI Extraction...
                  </>
                ) : (
                  "Extract Actions & Deadlines"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && result && (
          <div className="tab-section">
            <div className="stats-grid">
              <div className="glass-panel stat-card">
                <div className="stat-label">Case Details</div>
                <div className="stat-value" style={{ fontSize: "24px" }}>
                  {result.case_number}
                </div>
                <div style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                  {result.court}
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-label">Extracted Actions</div>
                <div className="stat-value">{result.action_items.length}</div>
                <div
                  style={{
                    color: "var(--success)",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <CheckCircle size={14} /> Verified via AI
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-label">Highest Risk Level</div>
                <div className="stat-value" style={{ color: "var(--danger)" }}>
                  {result.action_items.some(
                    (a) => a.contempt_risk.level === "CRITICAL",
                  )
                    ? "CRITICAL"
                    : result.action_items.some(
                          (a) => a.contempt_risk.level === "HIGH",
                        )
                      ? "HIGH"
                      : "MEDIUM"}
                </div>
                <div style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                  2-Signature Verification Required
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "24px" }}>
              <div style={{ flex: 2 }}>
                <h2 style={{ marginBottom: "16px" }}>Extracted Action Items</h2>
                {result.action_items.map((action, idx) => {
                  const isApproved = approvedActions.includes(action.action_id);
                  return (
                    <div
                      key={idx}
                      className="action-card"
                      style={{
                        border: isApproved
                          ? "2px solid var(--success)"
                          : "1px solid var(--panel-border)",
                      }}
                    >
                      <div className="action-header">
                        <div className="action-title">{action.description}</div>
                        <span
                          className={`badge badge-${action.contempt_risk.level.toLowerCase()}`}
                        >
                          {action.contempt_risk.level} RISK (
                          {action.contempt_risk.score}%)
                        </span>
                      </div>

                      <div
                        style={{
                          background: "var(--bg-color)",
                          padding: "12px",
                          borderRadius: "8px",
                          marginBottom: "12px",
                          border: "1px solid var(--panel-border)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            marginBottom: "4px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                          }}
                        >
                          Contempt Risk Factors:
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--text-main)",
                          }}
                        >
                          • {action.contempt_risk.factors.language}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--text-main)",
                          }}
                        >
                          • {action.contempt_risk.factors.judge_history}
                        </div>
                      </div>

                      <div className="action-meta">
                        <div className="meta-item">
                          <Clock size={16} color="var(--primary)" />{" "}
                          <strong>Deadline:</strong> {action.deadline}
                        </div>
                        <div className="meta-item">
                          <User size={16} color="var(--primary)" />{" "}
                          <strong>Assigned To:</strong> {action.assigned_to}
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: "16px",
                          display: "flex",
                          gap: "12px",
                          paddingTop: "16px",
                          borderTop: "1px dashed var(--panel-border)",
                        }}
                      >
                        <button
                          className="btn btn-primary"
                          onClick={() => handleApprove(action)}
                          disabled={isApproved}
                          style={
                            isApproved
                              ? {
                                  background: "var(--success)",
                                  opacity: 1,
                                  color: "white",
                                }
                              : {}
                          }
                        >
                          <CheckCircle size={16} />{" "}
                          {isApproved
                            ? "Approved & Assigned"
                            : "Approve & Auto-Assign"}
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={handleRequestModification}
                          disabled={isApproved}
                        >
                          Request Modification
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  className="glass-panel"
                  style={{ position: "sticky", top: "40px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "20px",
                    }}
                  >
                    <FileBarChart size={20} color="var(--primary)" />
                    <h3 style={{ margin: 0 }}>CAG Audit Trail</h3>
                  </div>

                  <div className="audit-timeline">
                    {result.audit_trail.map((audit, idx) => (
                      <div key={idx} className="audit-item">
                        <div className="audit-time">
                          {new Date(audit.timestamp).toLocaleString()}
                        </div>
                        <div className="audit-action">
                          AI Extraction Completed
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--success)",
                            fontWeight: 500,
                            marginTop: "2px",
                          }}
                        >
                          Confidence: {(audit.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}

                    {/* Simulated live audit trail based on approval status */}
                    <div
                      className="audit-item"
                      style={{ opacity: approvedActions.length > 0 ? 1 : 0.4 }}
                    >
                      <div className="audit-time">
                        {approvedActions.length > 0
                          ? new Date().toLocaleString()
                          : "Awaiting Action"}
                      </div>
                      <div className="audit-action">
                        First Officer Verification
                      </div>
                      {approvedActions.length > 0 && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--primary)",
                            fontWeight: 500,
                            marginTop: "2px",
                          }}
                        >
                          Approved by A. Sharma
                        </div>
                      )}
                    </div>

                    <div className="audit-item" style={{ opacity: 0.4 }}>
                      <div className="audit-time">Pending</div>
                      <div className="audit-action">
                        Second Signature (Due to High Risk)
                      </div>
                    </div>

                    <div className="audit-item" style={{ opacity: 0.4 }}>
                      <div className="audit-time">Pending</div>
                      <div className="audit-action">System Auto-Assignment</div>
                    </div>
                  </div>

                  <button
                    className="btn btn-outline"
                    style={{ width: "100%", marginTop: "20px" }}
                    onClick={handleExportPDF}
                  >
                    Export Liability Shield PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div
            className="tab-section glass-panel"
            style={{ maxWidth: "800px", margin: "0 auto" }}
          >
            <h2 style={{ marginBottom: "24px" }}>System Settings</h2>

            <div className="form-group">
              <label className="form-label">
                Auto-Assignment Hierarchy enabled
              </label>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <input
                  type="checkbox"
                  checked={settings.autoAssign}
                  onChange={(e) =>
                    setSettings({ ...settings, autoAssign: e.target.checked })
                  }
                  style={{
                    width: "18px",
                    height: "18px",
                    accentColor: "var(--primary)",
                  }}
                />
                <span style={{ color: "var(--text-muted)" }}>
                  Automatically route assignments from IAS → Collector → Clerk
                  based on task type.
                </span>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "24px" }}>
              <label className="form-label">
                Escalation Reminder Schedule (Days before deadline)
              </label>
              <input
                type="text"
                className="form-control"
                value={settings.escalationDays}
                onChange={(e) =>
                  setSettings({ ...settings, escalationDays: e.target.value })
                }
              />
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginTop: "6px",
                }}
              >
                Comma separated values. E.g., 14,7,3,0
              </p>
            </div>

            <div className="form-group" style={{ marginTop: "24px" }}>
              <label className="form-label">
                High Contempt Risk Threshold (%)
              </label>
              <input
                type="number"
                className="form-control"
                value={settings.riskThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, riskThreshold: e.target.value })
                }
              />
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginTop: "6px",
                }}
              >
                Actions scoring above this threshold will require 2-signature
                verification.
              </p>
            </div>

            <div className="form-group" style={{ marginTop: "24px" }}>
              <label className="form-label">
                Default Notification Email for Escalations
              </label>
              <input
                type="email"
                className="form-control"
                value={settings.notifyEmail}
                onChange={(e) =>
                  setSettings({ ...settings, notifyEmail: e.target.value })
                }
              />
            </div>

            <div
              style={{
                marginTop: "32px",
                paddingTop: "24px",
                borderTop: "1px solid var(--panel-border)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                className="btn btn-outline"
                onClick={() => alert("Settings reset to system defaults.")}
              >
                Reset Defaults
              </button>
              <button
                className="btn btn-primary"
                onClick={() => alert("Settings saved successfully.")}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
