import React from "react";
import { Modal, Button } from "react-bootstrap";
import { CheckCircle, XCircle } from "lucide-react";

const ConfirmModal = ({ show, message, yesText, noText, onClose, onConfirm }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Body className="p-4 text-center">
        <h4 className="mb-3">Confirm Action</h4>
        <p className="mb-4">{message}</p>
        <div className="d-flex justify-content-center gap-3">
          <Button variant="danger" onClick={onConfirm} className="d-flex align-items-center gap-2">
            <CheckCircle size={18} /> {yesText}
          </Button>
          <Button variant="secondary" onClick={onClose} className="d-flex align-items-center gap-2">
            <XCircle size={18} /> {noText}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmModal;
