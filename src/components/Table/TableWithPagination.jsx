import { useEffect, useState } from "react";
import { axiosInstance } from "../../middleware/customAxios";
import styles from "../../styles/Management/ManagementSearch.module.scss";
import Table from "react-bootstrap/Table";
import CustomPagination from "../Pagination/CustomPagination";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { expired, getNewToken } from "../../services/auth2";
import { containToken } from "../../Store/tokenSlice";
import { containIsAdmin } from "../../Store/isAdminSlice";

const TableWithPagination = ({ apiEndpoint, searchApiEndpoint, columns, renderRow, pageSize = 5, reloadTrigger, pageCount: propsPageCount, setPageCount: propsSetPageCount }) => {
    // Props로 넘어온 pageCount와 setPageCount를 사용하고, 없으면 로컬 상태로 선언
    const [localPageCount, setLocalPageCount] = useState(0);
    const pageCount = propsPageCount ?? localPageCount;
    const setPageCount = propsSetPageCount ?? setLocalPageCount;

    const [data, setData] = useState(null);
    const [searchParams, setSearchParams] = useState({});

    // refresh token 가져오기
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);

    // redux에서 가져오기
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    async function tokenHandler() {
        const isExpired = expired();
        if (isExpired) {
            let refreshToken = cookies.refreshToken;
            try {
                const result = await getNewToken(refreshToken);
                refreshToken = result.newRefreshToken;

                // refresh token cookie에 재설정
                setCookie('refreshToken', refreshToken, {
                    path: '/',
                    maxAge: 7 * 24 * 60 * 60, // 7일
                });

                // Redux access token 재설정
                dispatch(containToken(result.newToken));
                dispatch(containIsAdmin(true));
            } catch (error) {
                console.log(error);
                navigate('/Management');
            }
        }
    }

    const handleSearchChange = (columnKey, value) => {
        setSearchParams((prev) => ({
            ...prev,
            [columnKey]: value,
        }));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 토큰 핸들러 호출 (토큰 갱신이 필요하면 갱신)
                await tokenHandler();

                // 검색 쿼리 문자열 생성
                const searchQuery = Object.keys(searchParams)
                    .filter((key) => searchParams[key] !== "") // 값이 비어있지 않은 경우에만 필터링
                    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(searchParams[key])}`)
                    .join('&');

                // 토큰 갱신 후에 데이터를 가져옴
                const endpoint = searchQuery ? `${searchApiEndpoint}/${pageCount}/${pageSize}?${searchQuery}` : `${apiEndpoint}/${pageCount}/${pageSize}`;
                const response = await axiosInstance.get(endpoint);
                setData(response.data);
                console.log(apiEndpoint);
                console.log(searchQuery)
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData(); // 비동기 함수 호출
    }, [pageCount, apiEndpoint, searchApiEndpoint, pageSize, reloadTrigger, searchParams]); // 의존성 배열

    return (
        <>
            <Table striped bordered hover className={styles.userTable}>
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>
                                {col.header}
                                {col.header !== 'actions' && col.header !== 'enabled' &&
                                <input
                                    type="text"
                                    placeholder={`Search ${col.header}`}
                                    value={searchParams[col.header] || ""}
                                    onChange={(e) => handleSearchChange(col.header, e.target.value)}
                                    className={styles.searchInput}
                                />}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data ? data.content.map((item, index) => renderRow(item, index)) : <tr><td colSpan={columns.length + 1}>Loading...</td></tr>}
                </tbody>
            </Table>
            {data && (
                <CustomPagination
                    data={data}
                    size="sm"
                    current={pageCount + 1}
                    onPageChange={(cur) => setPageCount(cur - 1)}
                />
            )}
        </>
    );
};

export default TableWithPagination;
