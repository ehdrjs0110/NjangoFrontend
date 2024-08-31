import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { axiosInstance } from "../../../middleware/customAxios";
import PropTypes from "prop-types";

const UserEditModal = ({ show, handleClose, user, onSave }) => {
    const [formData, setFormData] = useState({
        id: user.id,
        nickname: user.nickname,
        phoneNumber: user.phoneNumber,
        role: user.role,
        kakao: user.kakao,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = () => {
        axiosInstance.put(`management/user/updateUser`, formData)
            .then(response => {
                console.log("User updated successfully:", response.data);
                onSave(); // Save callback to reload user data
                handleClose();
            })
            .catch(error => {
                console.error("There was an error updating the user!", error);
            });
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formUserId">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="id"
                            value={formData.id}
                            readOnly
                        />
                    </Form.Group>

                    <Form.Group controlId="formNickname">
                        <Form.Label>Nickname</Form.Label>
                        <Form.Control
                            type="text"
                            name="nickname"
                            value={formData.nickname}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group controlId="formPhoneNumber">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber || ""}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group controlId="formRole">
                        <Form.Label>Role</Form.Label>
                        <Form.Control
                            as="select"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="formKakao">
                        <Form.Check
                            type="checkbox"
                            label="Kakao Linked"
                            name="kakao"
                            checked={formData.kakao}
                            onChange={() => setFormData({ ...formData, kakao: !formData.kakao })}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

UserEditModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        nickname: PropTypes.string.isRequired,
        phoneNumber: PropTypes.string,
        role: PropTypes.oneOf(["USER", "ADMIN"]).isRequired,
        kakao: PropTypes.bool.isRequired,
    }).isRequired,
    onSave: PropTypes.func.isRequired,
};

export default UserEditModal;
