////working success
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

const GetInTouch = () => {
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
    { key: "phone", label: "Phone" },
    { key: "subject", label: "Subject" },
    { key: "message", label: "Message" },
  ];

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await instance.get("getintouch/find-getintouch", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      setTeam(response.data.responseData);
      setData(response.data.responseData); // Update data in context
    } catch (error) {
      console.error("Error fetching team data:", error);
      toast.error("Error fetching data");
    }
  };


  useEffect(() => {
    if (shows) {

    }
  }, [shows]);

  const exportData = () => {
    const dataToExport = searchQuery.trim() ? filteredData : team;
    handleExport(dataToExport, tableColumns, "GetInTouch");
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

export default GetInTouch;
