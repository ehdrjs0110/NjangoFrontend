import React, {useEffect, useState} from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import {expired, getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useCookies} from "react-cookie";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {axiosInstance} from "../../middleware/customAxios";


const AllergyModel = (props) => {
    const [selectedCategories, setSelectedCategories] = useState({});
    const [filterData,setFilterData] = useState([]);
    const [isChange, setIsChange] = useState(false);
    const navigate = useNavigate();

    // auth 관련 --
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    // const { handleTokenRefresh } = useSetNewAuth();




    // redux에서 가져오기
    let accessToken = useSelector(state => state.token.value);

    let  userId = useSelector(state=> state.userEmail.value);

    const dispatch = useDispatch();
    // --

    useEffect( () =>  {
        fecthData();
        const initialSelection = categories.reduce((acc, category) => {
            const selectedSubs = category.subcategories.reduce((subAcc, sub) => {
                if (filterData.includes(sub)) {
                    return { ...subAcc, [sub]: true };
                }
                return subAcc;
            }, {});

            if (Object.keys(selectedSubs).length > 0) {
                return { ...acc, [category.name]: selectedSubs };
            }
            return acc;
        }, {});
        setSelectedCategories(initialSelection);
        setIsChange(true);
    }, [isChange]);

    async function fecthData()  {
        await axiosInstance.get(`filter/${userId}`).then((r)=> {
            setFilterData(r.data);
        }).catch((e) => console.error());
    }


    const categories = [
        { name: "갑각류", subcategories: ["새우", "게", "랍스터"] },
        { name: "어패류", subcategories: ["오징어", "조개", "홍합"] },
        { name: "견과류", subcategories: ["아몬드", "호두", "캐슈넛"] },
        { name: "과일", subcategories: ["사과", "바나나", "귤"] },
        { name: "유제품", subcategories: ["우유", "치즈", "요거트"] },
        // 추가적인 카테고리
    ];

    const handleCategoryChange = (category, isChecked) => {
        setSelectedCategories(prev => ({
            ...prev,
            [category]: isChecked
                ? categories.find(c => c.name === category).subcategories.reduce((acc, sub) => ({ ...acc, [sub]: true }), {})
                : {}
        }));


        let categorySubcategories = categories.find(c => c.name === category).subcategories;

        setFilterData(prev => {
            if (isChecked) {
                // 카테고리가 체크되었을 때 해당 카테고리의 모든 서브카테고리를 추가
                return [...prev, ...categorySubcategories.filter(sub => !prev.includes(sub))];  // 중복 제거
            } else {
                // 카테고리가 언체크되었을 때 해당 카테고리의 모든 서브카테고리를 제거
                return prev.filter(sub => !categorySubcategories.includes(sub));
            }
        });

    };

    const handleSubcategoryChange = (category, subcategory, isChecked) => {
        setSelectedCategories(prev => {
            // Update the subcategory state
            const updatedSubcategories = {
                ...prev[category],
                [subcategory]: isChecked
            };

            // Check if all subcategories are unchecked
            const allSubcategoriesUnchecked = Object.values(updatedSubcategories).every(value => !value);

            return {
                ...prev,
                [category]: allSubcategoriesUnchecked ? {} : updatedSubcategories
            };
        });

        setFilterData(prev => {
            if (isChecked) {
                return [...prev, subcategory];
            } else {
                const updatedFilter = prev.filter(item => item !== subcategory);  // Remove the subcategory if unchecked
                if (updatedFilter.every(item => !categories.find(c => c.name === category).subcategories.includes(item))) {
                    // If all subcategories are unchecked, remove the main category's subcategories from filterData
                    return updatedFilter.filter(item => !categories.find(c => c.name === category).subcategories.includes(item));
                }
                return updatedFilter;
            }
        });
    };


    async function tokenHandler() {
        const isExpired = expired();
        if(isExpired){
            let refreshToken = cookies.refreshToken;
            try {
                const result = await getNewToken(refreshToken);
                refreshToken = result.newRefreshToken;
                setCookie(
                    'refreshToken',
                    refreshToken,
                    {
                        path:'/',
                        maxAge: 7 * 24 * 60 * 60, // 7일
                    }
                )
                dispatch(containToken(result.newToken));
            } catch (error) {
                console.log(error);
                navigate('/Sign');
            }
        }
    }

    async function updateFilter() {

        console.log(filterData);
        try {
            await tokenHandler();
            await axiosInstance.put(`filter/${userId}`,filterData);
        }catch (e){
            console.log(e);
        }

    }


    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    알레르기 설정
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {categories.map(category => (
                        <div key={category.name} style={{ marginBottom: '1rem' }}>
                            <Form.Check
                                type="checkbox"
                                label={category.name}
                                checked={Object.keys(selectedCategories[category.name] || {}).length > 0}
                                onChange={e => handleCategoryChange(category.name, e.target.checked)}
                            />
                            <div style={{ marginLeft: '1rem' }}>
                                {category.subcategories.map(sub => (
                                    <Form.Check
                                        key={sub}
                                        type="checkbox"
                                        label={sub}
                                        checked={!!selectedCategories[category.name]?.[sub]}
                                        onChange={e => handleSubcategoryChange(category.name, sub, e.target.checked)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={updateFilter}>저장</Button>
                <Button onClick={props.onHide}>닫기</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AllergyModel;
