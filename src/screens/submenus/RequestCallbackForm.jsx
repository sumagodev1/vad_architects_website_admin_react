////sos
import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { useSearchExport } from "../../context/SearchExportContext";
import { ShowContext } from "../../context/ShowContext";
import SearchInput from "../../components/search/SearchInput";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TablePagination from "../../components/pagination/TablePagination";
import instance from "../../api/AxiosInstance";

const RequestCallbackForm = () => {
  const { searchQuery, handleSearch, handleExport, setData, filteredData, data } = useSearchExport();
  const { shows } = useContext(ShowContext);
  const [team, setTeam] = useState([]);

  const tableColumns = [
    {
      key: "srNo",
      label: "Sr. No.",
      render: (value, index) => index + 1, // Adding serial number starting from 1
    },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "message", label: "Message" },
  ];

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await instance.get("requestcallbackform/find-requestcallback", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const reversedData = response.data.responseData.reverse();
      setTeam(reversedData);
      setData(reversedData);
    } catch (error) {
      console.error("Error fetching team data:", error);
    }
  };

  const handleDelete = async (id) => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      await instance.delete(`requestcallbackform/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("Data Deleted Successfully");
      fetchTeam();
    } catch (error) {
      console.error("Error deleting data:", error);
      toast.error("Error deleting data");
    }
  };

  useEffect(() => {
    if (shows) {

    }
  }, [shows]);

  const exportData = () => {
    const dataToExport = searchQuery.trim() ? filteredData : team;
    handleExport(dataToExport, tableColumns, "RequestCallbackForm");
  };

  return (
    <Container>
      <Row>
        <Col>
          <SearchInput
            searchQuery={searchQuery}
            onSearch={handleSearch}
            onExport={exportData}
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                {tableColumns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
  
              </tr>
            </thead>
            <tbody>
            {(searchQuery.trim() ? filteredData : team).map(
                  (item, index) => (
                    <tr key={item.id}>
                      {tableColumns.map((col) => (
                        <td key={col.key}>
                          {col.key === "srNo"
                            ? index + 1
                            : col.render
                            ? col.render(item[col.key], index)
                            : item[col.key]}
                        </td>
                      ))}
               
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      {/* <Row>
  <Col className="mt-3">
  <TablePagination />

  </Col>
</Row> */}
    </Container>
  );
};

export default RequestCallbackForm;





