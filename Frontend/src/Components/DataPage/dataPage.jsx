import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Button,
  CircularProgress
} from "@mui/material";
import { Edit, Delete, Save, Add } from "@mui/icons-material";

const API_URL = "http://localhost:8001";

const DataPage = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({});
  const [editIndex, setEditIndex] = useState(null);
  const [editedRow, setEditedRow] = useState({});
  const [loading, setLoading] = useState(false);

  console.log("row",editedRow)

  useEffect(() => {
    axios.get(`${API_URL}/list_tables`).then((res) => setTables(res.data.tables));
  }, []);

  const fetchTableData = async (tableName) => {
    setLoading(true);
    setSelectedTable(tableName);
    try {
      const res = await axios.get(`${API_URL}/display_table?table_name=${tableName}`);
      console.log("Fetched table data:", res.data);
      setColumns(res.data.columns);
      setRows(res.data.rows);

      const newRowTemplate = {};
      res.data.columns.forEach((col) => (newRowTemplate[col] = ""));
      setNewRow(newRowTemplate);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleInputChange = (e, col, index = null) => {
    const value = e.target.value;
    if (index === null) {
      setNewRow({ ...newRow, [col]: value });
    } else {
      const updated = { ...editedRow, [col]: value };
      setEditedRow(updated);
    //   console.log("updated row",JSON.stringify(updated));
    }
    
  };

  const handleAddRow = async () => {
    try {
    //   await axios.post(`${API_URL}${selectedTable}/insert_row`, newRow);
        const { id, ...data } = newRow;
      const updatedAddRow = {table_name: selectedTable,row_data : {...data}};
      await axios.post(`${API_URL}/insert_row`, updatedAddRow, {
        headers: {
            'Content-Type': 'application/json'
        }
        });
      fetchTableData(selectedTable);
    } catch (error) {
      console.error("Failed to add row:", error);
    }
  };

  const handleDeleteRow = async (rowData) => {
    try {
      await axios.delete(`${API_URL}/delete_row?table_name=${selectedTable}&row_id=${rowData.id}`);
      fetchTableData(selectedTable);
    } catch (error) {
      console.error("Failed to delete row:", error);
    }
  };

  const handleEditClick = (index, row) => {
    setEditIndex(index);
    setEditedRow(row);
  };

  const handleSaveEdit = async () => {
    try {
      const { id, ...updates } = editedRow;
      const updatedEditRow = {table_name: selectedTable,row_id : id ,updates : { ...updates}};
      await axios.patch(`${API_URL}/update_row`, updatedEditRow, {
        headers: {
            'Content-Type': 'application/json'
        }
        });

      setEditIndex(null);
      fetchTableData(selectedTable);
    } catch (error) {
      console.error("Failed to update row:", error);
    }
  };

  if(rows.length === 0 && selectedTable) {
    const data = rows.map((row, index) => {
  return columns.map((col) => {
    if (editIndex === index) {
      // Editing mode logic
      return editedRow[col] || "";
    } else {
      // Display mode logic
      return row[col];
    }
  });
});
console.log("Data to display:", rows);
  }

  return (
    <Box
      p={0}
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%)",
        display: "flex",
        alignItems: "flex-start", // changed from center
        justifyContent: "center",
        pt: 2 // add padding top to slightly separate from nav, but less than before
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1400, // further increased for wide tables
          borderRadius: 8,
          boxShadow: "0 2px 16px 0 #b6c2d933",
          p: { xs: 2, sm: 3 },
          m: 1
        }}
      >
        <Typography
          variant="h5"
          align="center"
          fontWeight={700}
          color="#2d3748"
          mb={1} // reduce margin bottom
          letterSpacing={1}
        >
          Data Table Manager
        </Typography>

        <FormControl fullWidth margin="normal" sx={{ mb: 1.5 }}>
          <InputLabel id="table-select-label">Select Table</InputLabel>
          <Select
            labelId="table-select-label"
            value={selectedTable}
            onChange={(e) => fetchTableData(e.target.value)}
            label="Select Table"
            sx={{
              background: "#f1f5fa",
              borderRadius: 2,
              fontWeight: 500
            }}
          >
            {tables.map((table) => (
              <MenuItem key={table} value={table}>
                {table}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading ? (
          <Box textAlign="center" mt={4}>
            <CircularProgress color="primary" />
          </Box>
        ) : selectedTable && (
          <Box mt={2}>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                background: "#f9fafb",
                minWidth: 1100, // match container width
                maxWidth: 1350 // just under container maxWidth
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: "#e2e8f0" }}>
                    {columns.map((col) => (
                      <TableCell
                        key={col}
                        sx={{
                          fontWeight: 700,
                          color: "#2d3748",
                          borderBottom: "1px solid #e2e8f0",
                          background: "#f1f5fa"
                        }}
                        align="center"
                      >
                        {col}
                      </TableCell>
                    ))}
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#2d3748",
                        borderBottom: "1px solid #e2e8f0",
                        background: "#f1f5fa"
                      }}
                      align="center"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} align="center" sx={{ color: "#a0aec0", py: 4 }}>
                        No data in this table yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          background: index % 2 === 0 ? "#f8fafc" : "#e9eef6"
                        }}
                      >
                        {columns.map((col) => (
                          <TableCell key={col} align="center">
                            {editIndex === index ? (
                              <TextField
                                variant="standard"
                                value={editedRow[col] || ""}
                                onChange={(e) => handleInputChange(e, col, index)}
                                sx={{
                                  background: "#fff",
                                  borderRadius: 1,
                                  fontSize: "0.95rem",
                                  minWidth: 180,
                                  pl: '1em' // add padding left
                                }}
                              />
                            ) : (
                              <span style={{ fontSize: "0.98rem" }}>{row[col]}</span>
                            )}
                          </TableCell>
                        ))}
                        <TableCell align="center">
                          {editIndex === index ? (
                            <IconButton color="primary" onClick={handleSaveEdit} sx={{ mr: 1 }}>
                              <Save fontSize="small" />
                            </IconButton>
                          ) : (
                            <IconButton color="info" onClick={() => handleEditClick(index, row)} sx={{ mr: 1 }}>
                              <Edit fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}

                  {/* Add New Row */}
                  {columns.length > 0 && (
                    <TableRow>
                      {columns.map((col) => (
                        <TableCell key={col} align="center">
                          <TextField
                            variant="standard"
                            placeholder={`Enter ${col}`}
                            value={newRow[col] || ""}
                            onChange={(e) => handleInputChange(e, col)}
                            sx={{
                              background: "#fff",
                              borderRadius: 1,
                              fontSize: "0.95rem",
                              minWidth: 180,
                              pl: '1em' // add padding left
                            }}
                          />
                        </TableCell>
                      ))}
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={handleAddRow}
                          sx={{
                            borderRadius: 2,
                            boxShadow: "none",
                            textTransform: "none",
                            fontWeight: 600,
                            px: 2,
                            py: 0.5,
                            fontSize: "0.95rem"
                          }}
                          startIcon={<Add />}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DataPage;
