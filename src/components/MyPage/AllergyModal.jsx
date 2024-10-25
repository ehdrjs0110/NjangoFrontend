import React, {useEffect, useState} from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import {expired, getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useCookies} from "react-cookie";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {axiosInstance} from "../../middleware/customAxios";

import styles from "../../styles/MyPage/AllergyModal.module.scss";
import shellfish from "../../assets/MyPageImg/shellfish.png";
import fish from "../../assets/MyPageImg/fish.png";
import nuts from "../../assets/MyPageImg/nuts.png";
import fruits from "../../assets/MyPageImg/fruits.png";
import dairy_products from "../../assets/MyPageImg/dairy_products.png";


const AllergyModal = (props) => {
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
    }, [isChange]);

    async function fecthData()  {
        console.log("알레르기 데이터 요청")
        await axiosInstance.get(`filter/${userId}`).then((r)=> {
            console.log(r.data)
            setFilterData(r.data);
        }).catch((e) => console.error());
        setIsChange(true);
    }


    const categories = [
        { name: "갑각류", subcategories: ["새우", "게", "랍스터"], icon: shellfish },
        { name: "어패류", subcategories: ["오징어", "조개", "홍합"], icon: fish },
        { name: "견과류", subcategories: ["아몬드", "호두", "캐슈넛"], icon: nuts },
        { name: "과일", subcategories: ["사과", "바나나", "귤"], icon: fruits },
        { name: "유제품", subcategories: ["우유", "치즈", "요거트"], icon: dairy_products },
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

    const isAllSubcategoriesChecked = (category) => {
        const subcategories = categories.find(c => c.name === category)?.subcategories || [];
        return subcategories.every(sub => selectedCategories[category]?.[sub]);
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
        <div
            {...props}
        >
            <div className={styles.title}>
                알레르기 설정
            </div>
            <Modal.Body className={styles.AllergyBody}>
                <Form>
                    {categories.map(category => (
                        <div key={category.name} style={{ marginBottom: '1rem' }} className={styles.CategoryWrapper}>
                            <div
                                className={styles.CategoryName}
                                // type="checkbox"
                                // label={category.name}
                                // checked={Object.keys(selectedCategories[category.name] || {}).length > 0}
                                // onChange={e => handleCategoryChange(category.name, e.target.checked)}
                            >
                                <img src={category.icon} alt={`${category.name} 아이콘`} className={styles.CategoryIcon} />
                                {category.name}
                            </div>
                            <div className={styles.CategorySubWrapper}>
                                <Form.Check
                                    className={styles.CategorySub}
                                    type='checkbox'
                                    id={`select-all-${category.name}`}
                                    label="All"
                                    checked={isAllSubcategoriesChecked(category.name)} // 모든 서브카테고리가 체크되었을 때만 체크 상태
                                    onChange={e => handleCategoryChange(category.name, e.target.checked)}
                                />
                                {category.subcategories.map(sub => (
                                    <Form.Check
                                        className={styles.CategorySub}
                                        key={sub}
                                        type="checkbox"
                                        label={sub}
                                        id={`subcategory-${sub}`}
                                        checked={!!selectedCategories[category.name]?.[sub]}
                                        onChange={e => handleSubcategoryChange(category.name, sub, e.target.checked)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </Form>
            </Modal.Body>
            <Modal.Footer className={styles.footer}>
                <button className={styles.SaveBtn} onClick={updateFilter}>저장</button>
                {/* <Button onClick={props.onHide}>닫기</Button> */}
            </Modal.Footer>
        </div>
    );
};

export default AllergyModal;
