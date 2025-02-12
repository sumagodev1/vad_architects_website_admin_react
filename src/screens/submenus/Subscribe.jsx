






import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Button,  Tooltip, OverlayTrigger,} from "react-bootstrap";
import { useSearchExport } from "../../context/SearchExportContext";
import { ShowContext } from "../../context/ShowContext";
import SearchInput from "../../components/search/SearchInput";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import instance from "../../api/AxiosInstance";
import DataTable from "react-data-table-component";
import { ThreeDots } from "react-loader-spinner";
import { FaTrash } from "react-icons/fa";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const Subscribe = () => {
  const {
    searchQuery,
    handleSearch,
    handleExport,
    setData,
    filteredData,
  } = useSearchExport();
  const { shows } = useContext(ShowContext);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 10 rows per page
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    fetchTeam(currentPage, rowsPerPage);
  }, [currentPage, rowsPerPage]);

  const fetchTeam = async (page, limit) => {
    const accessToken = localStorage.getItem("accessToken");
    setLoading(true);
    try {
      const response = await instance.get("subscribe/find-subscribedemail", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        params: {
          page,
          limit,
        },
      });
      const reversedData = response.data.responseData.reverse();
      setTeam(reversedData);
      setData(reversedData);
      setTotalRows(response.data.totalCount || reversedData.length); // Set total rows
    } catch (error) {
      console.error("Error fetching team data:", error);
      toast.error("Error fetching team data");
    } finally {
      setLoading(false);
    }
  };
  const exportData = () => {
    const dataToExport = searchQuery.trim() ? filteredData : team;
    handleExport(dataToExport, tableColumns, "Subscribers");
  };


  const handleDelete = async (id) => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this email?",
      customUI: ({ onClose }) => (
        <div
          style={{
            textAlign: "left",
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(5, 5, 5, 0.2)",
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          <h2>Confirm to delete</h2>
          <p>Are you sure you want to delete this email?</p>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "20px",
            }}
          >
            <button
              style={{ marginRight: "10px" }}
              className="btn btn-primary"
              onClick={async () => {
                setLoading(true);
                const accessToken = localStorage.getItem("accessToken");
                try {
                  await instance.delete(`subscribe/delete/${id}`, {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                      "Content-Type": "application/json",
                    },
                  });
                  toast.success("Email Deleted Successfully");
                  fetchTeam(currentPage, rowsPerPage); // Refresh data after deletion
                } catch (error) {
                  console.error("Error deleting email:", error);
                  toast.error("Error deleting email");
                } finally {
                  setLoading(false);
                }
                onClose();
              }}
            >
              Yes
            </button>
            <button className="btn btn-secondary" onClick={() => onClose()}>
              No
            </button>
          </div>
        </div>
      ),
    });
  };

  const CustomHeader = ({ name }) => (
    <div style={{ fontWeight: "bold", color: "black", fontSize: "16px" }}>
      {name}
    </div>
  );

  const tableColumns = [
    {
      name: <CustomHeader name="Sr. No." />,
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      key: "srNo",
    },
    {
      name: <CustomHeader name="Email" />,
      selector: (row) => row.email,
      key: "email",
    },
    {
      name: <CustomHeader name="Date" />,
      selector: (row) => (row.createdAt)?.slice(0,10),
      key: "message",
    },
    {
      name: <CustomHeader name="Actions" />,
      cell: (row) => (
        <div className="d-flex">
          <OverlayTrigger
           placement="top"
           overlay={<Tooltip id="delete-tooltip">Delete</Tooltip>}
        >
        <Button className="ms-1" style={{backgroundColor:"red",color:"white",borderColor:"red"}} onClick={() => handleDelete(row.id)}>
            <FaTrash />
          </Button>
        </OverlayTrigger>
        </div>
      ),
    },
  ];

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
          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "100px" }}
            >
              <ThreeDots
                height="80"
                width="80"
                radius="9"
                color="#000"
                ariaLabel="three-dots-loading"
                visible={true}
              />
            </div>
          ) : (
            <DataTable
              columns={tableColumns}
              data={filteredData.length > 0 ? filteredData : team}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              paginationDefaultPage={currentPage}
              paginationPerPage={rowsPerPage}
              onChangePage={(page) => setCurrentPage(page)}
              onChangeRowsPerPage={(newRowsPerPage) =>
                setRowsPerPage(newRowsPerPage)
              }
              responsive
              striped
              noDataComponent="No Data Available"
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Subscribe;