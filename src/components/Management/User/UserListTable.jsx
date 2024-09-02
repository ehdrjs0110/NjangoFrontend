import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import TableWithPagination from "../../Table/TableWithPagination";
import { axiosInstance } from "../../../middleware/customAxios";
import UserEditModal from "./UserEditModal";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import style from "../../../styles/Management/ManagementDashboard.module.scss";
import {useCookies} from "react-cookie";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {expired, getNewToken} from "../../../services/auth2";
import {containToken} from "../../../Store/tokenSlice";
import {containIsAdmin} from "../../../Store/isAdminSlice";

const UserListTable = ({ type }) => {
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [pageCounts, setPageCounts] = useState({
        all: 0,
        user: 0,
        admin: 0
    });

    // refresh token 가져오기
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);

    // redux에서 가져오기
    const dispatch = useDispatch();
    const navigate = useNavigate();

    async function tokenHandler() {


        const isExpired = expired();
        if(isExpired){

            let refreshToken = cookies.refreshToken;
            try {

                // getNewToken 함수 호출 (비동기 함수이므로 await 사용)
                const result = await getNewToken(refreshToken);
                refreshToken = result.newRefreshToken;

                // refresh token cookie에 재설정
                setCookie(
                    'refreshToken',
                    refreshToken,
                    {
                        path:'/',
                        maxAge: 7 * 24 * 60 * 60, // 7일
                        // expires:new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
                    }
                )

                // Redux access token 재설정
                dispatch(containToken(result.newToken));
                dispatch(containIsAdmin(true));

            } catch (error) {
                console.log(error);
                navigate('/Management');
            }
        }

    }



    const handleEditUser = async (userId) => {
        await tokenHandler();
        axiosInstance.get(`management/user/getUserByUserId/${userId}`)
            .then(response => {
                setSelectedUser(response.data);
                setShowModal(true);
            })
            .catch(error => {
                console.error("There was an error getting the user!", error);
            });
    };

    const handleDelete = async (userId) => {
        await tokenHandler();
        await axiosInstance.delete(`management/user/deleteUserByUserId/${userId}`)
            .then(response => {
                setReloadTrigger(!reloadTrigger);
            })
            .catch(error => {
                console.error("There was an error deleting the user!", error);
            });
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleSave = () => {
        setReloadTrigger(!reloadTrigger);
    };

    const columns = [
        { header: 'id' },
        { header: 'nickname' },
        { header: 'phoneNumber' },
        { header: 'role' },
        { header: 'kakao' },
        { header: 'createAt' },
        { header: 'enabled' },
        { header: 'actions' }
    ];

    const renderUserRow = (user, index) => {
        const rowClass = user.role === 'ADMIN' ? 'table-danger' : '';
        return (
            <tr key={index} className={rowClass}>
                <td>{user.id}</td>
                <td>{user.nickname}</td>
                <td>{user.phoneNumber || "N/A"}</td>
                <td>{user.role}</td>
                <td>{user.kakao ? "TRUE" : "FALSE"}</td>
                <td>{new Date(user.createAt).toLocaleString()}</td>
                <td>{user.enabled ? "Active" : "Inactive"}</td>
                <td>
                    <Button variant="warning" size="sm" onClick={() => handleEditUser(user.id)}>
                        수정
                    </Button>{' '}
                    <Button variant="danger" size="sm" onClick={() => handleDelete(user.id)}>
                        삭제
                    </Button>{' '}
                </td>
            </tr>
        );
    };

    // 현재 type에 따른 pageCount를 업데이트하는 함수를 반환하는 함수
    const setPageCountForType = (type) => (newPageCount) => {
        setPageCounts(prevCounts => ({
            ...prevCounts,
            [type]: newPageCount
        }));
    };

    return (
        <Col className={style.downPartCol}>
            <Card border="light">
                <Card.Title>
                    {type === "user" ? "사용자 목록" : type === "admin" ? "관리자 목록" : "ALL"}
                </Card.Title>
                <Card.Body>
                    <TableWithPagination
                        apiEndpoint={
                            type === "user" 
                                ? "management/user/getUserListbyIndex" 
                                : type === "admin"
                                    ? "management/user/getAdminListbyIndex"
                                    : "management/user/getAllUserListbyIndex"
                        }                        
                        searchApiEndpoint={
                            type === "user" 
                                ? "management/user/getUserListbyIndexSearch" 
                                : type === "admin"
                                    ? "management/user/getAdminListbyIndexSearch"
                                    : "management/user/getAllUserListbyIndexSearch"}
                        columns={columns}
                        renderRow={renderUserRow}
                        pageSize={5}
                        reloadTrigger={reloadTrigger}
                        pageCount={pageCounts[type]}  // 현재 type에 따른 pageCount
                        setPageCount={setPageCountForType(type)}  // 현재 type에 따른 setPageCount 함수
                    />
                    {selectedUser && (
                        <UserEditModal
                            show={showModal}
                            handleClose={handleModalClose}
                            user={selectedUser}
                            onSave={handleSave}
                        />
                    )}
                </Card.Body>
            </Card>
        </Col>
    );
};

export default UserListTable;
