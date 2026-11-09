
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

const API_URL = "http://localhost:9193/admin/activity-logs";

export default function ActivityHistory() {
  const today = new Date().toLocaleDateString("en-CA");

  const [logs, setLogs] = useState([]);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [username, setUsername] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please sign in again to view activity history.");
      }

      const params = new URLSearchParams();

      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);
      if (username.trim()) params.set("username", username.trim());
      if (endpoint.trim()) params.set("endpoint", endpoint.trim());

      const response = await fetch(`${API_URL}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your session has expired. Please sign in again.");
        }

        if (response.status === 403) {
          throw new Error(
            "Access denied. Only authorized administrators or managers can view this page."
          );
        }

        throw new Error(`Unable to load activity history (${response.status}).`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The server returned an unexpected response.");
      }

      setLogs(data);
    } catch (err) {
      setError(err.message || "Unable to load activity history.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, username, endpoint]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString();
  };

  const exportCSV = () => {
    const headers = [
      "Date and time",
      "Username",
      "Role",
      "Method",
      "Endpoint",
      "HTTP status",
      "IP address",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = logs.map((log) => [
      log.createdAt,
      log.username,
      log.role,
      log.httpMethod,
      log.endpoint,
      log.statusCode,
      log.ipAddress,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `activity-history-${fromDate || "all"}-to-${toDate || "all"}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setUsername("");
    setEndpoint("");
  };

  const getStatusVariant = (status) => {
    if (status >= 200 && status < 300) return "success";
    if (status >= 400 && status < 500) return "warning";
    if (status >= 500) return "danger";
    return "secondary";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "28px 0",
      }}
    >
      <div className="container-fluid px-3 px-lg-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <div
              style={{
                fontSize: 12,
                color: "#64748b",
                fontWeight: 700,
                letterSpacing: 1.4,
              }}
            >
              SECURITY & MONITORING
            </div>

            <h2 className="fw-bold mt-2 mb-1" style={{ color: "#172554" }}>
              User Activity History
            </h2>

            <p className="text-muted mb-0">
              Review recorded requests made to the system by staff.
            </p>
          </div>

          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={loadLogs}
              disabled={loading}
            >
              Refresh
            </Button>

            <Button
              style={{
                background: "#172554",
                borderColor: "#172554",
              }}
              onClick={exportCSV}
              disabled={logs.length === 0}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} lg={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="text-muted small">Recorded Activities</div>
                <h3 className="fw-bold mb-0 mt-2">{logs.length}</h3>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="text-muted small">Distinct User Labels</div>
                <h3 className="fw-bold mb-0 mt-2">
                  {new Set(logs.map((log) => log.username)).size}
                </h3>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="text-muted small">Failed HTTP Responses</div>
                <h3 className="fw-bold mb-0 mt-2">
                  {logs.filter((log) => log.statusCode >= 400).length}
                </h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <h5 className="fw-bold mb-3">Filter activity</h5>

            <Form
              onSubmit={(e) => {
                e.preventDefault();
                loadLogs();
              }}
            >
              <Row className="g-3">
                <Col xs={12} sm={6} lg={3}>
                  <Form.Label>From date</Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Col>

                <Col xs={12} sm={6} lg={3}>
                  <Form.Label>To date</Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Col>

                <Col xs={12} sm={6} lg={3}>
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    placeholder="Search staff username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Col>

                <Col xs={12} sm={6} lg={3}>
                  <Form.Label>Endpoint</Form.Label>
                  <Form.Control
                    placeholder="e.g. /api/sales"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                  />
                </Col>

                <Col xs={12} className="d-flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    style={{
                      background: "#172554",
                      borderColor: "#172554",
                    }}
                    disabled={loading}
                  >
                    Apply Filters
                  </Button>

                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <div className="p-3 p-lg-4 border-bottom">
              <h5 className="fw-bold mb-1">Activity Records</h5>
              <div className="text-muted small">
                Newest activities appear first.
              </div>
            </div>

            <div className="table-responsive">
              <Table hover className="mb-0" style={{ minWidth: 950 }}>
                <thead className="table-light">
                  <tr>
                    <th>Date & Time</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Method</th>
                    <th>Endpoint</th>
                    <th>Status</th>
                    <th>IP Address</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5">
                        <Spinner animation="border" size="sm" className="me-2" />
                        Loading activity history...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-5">
                        No recorded activities match these filters.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td className="text-nowrap">
                          {formatDate(log.createdAt)}
                        </td>

                        <td className="fw-semibold">
                          {log.username || "Unknown"}
                        </td>

                        <td>{log.role || "—"}</td>

                        <td>
                          <Badge bg="light" text="dark" className="border">
                            {log.httpMethod}
                          </Badge>
                        </td>

                        <td style={{ maxWidth: 300, overflowWrap: "anywhere" }}>
                          {log.endpoint}
                        </td>

                        <td>
                          <Badge bg={getStatusVariant(log.statusCode)}>
                            {log.statusCode ?? "—"}
                          </Badge>
                        </td>

                        <td>{log.ipAddress || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        <p className="text-muted small mt-3">
          This page displays recorded backend requests. It does not track every
          mouse click or activity performed locally in the browser.
        </p>
      </div>
    </div>
  );
}
