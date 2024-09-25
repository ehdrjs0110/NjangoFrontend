import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Navigation from "../../components/Nav/Navigation";
import Photo from "../../components/gallery/Photo";
import styles from '../../styles/Gallery/Gallery.module.scss';

import UpdateModel from '../../components/gallery/UploadPhoto';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import {axiosInstance} from "../../middleware/customAxios";

const Gallery = () => {

    //modal
    const [modalShow, setModalShow] = useState(false);
    const [isChange, setChange] = useState(false);

    return (
        <>
            <Navigation />
            <Row className={styles.controllerRow}>
                <Col md={{ span: 10, offset: 1 }} className={styles.controller}>
                    <div className={styles.btnGroup}>
                        <Button size="lg" onClick={() => setModalShow(true)}>
                            <FontAwesomeIcon icon={faPlus} />
                        </Button>
                        <UpdateModel
                            show={modalShow}
                            onHide={() => {setModalShow(false)}}
                            onUploadComplete={() => setChange(prev => !prev)} // 파일 업로드 완료 시 상태 변경
                        />
                    </div>
                </Col>
            </Row>
            <Photo isChangeUpload={isChange}/>
        </>
    );
}

export default Gallery;
