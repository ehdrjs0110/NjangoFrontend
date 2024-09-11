import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import Card from 'react-bootstrap/Card';
import {Accordion} from "react-bootstrap";
import Navigation from "../../components/Nav/Navigation";
import Photo from "../../components/gallery/Photo";
// import Navigation from '../../components/Nav/Navigation'




const Gallery = () => {


    return (
        <>
            <Navigation />
            <Photo/>
        </>
    );
}

export default Gallery;
