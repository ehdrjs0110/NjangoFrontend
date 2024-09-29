import React from 'react';
import { Select, MenuItem } from '@mui/material';

const options = ["g", "kg", "개", "ml", "통"];

function SelectEditor(props) {
    const { id, value, api } = props;

    const handleChange = (event) => {
        api.setEditCellValue({ id, field: 'unit', value: event.target.value });
    };

    return (
        <Select
            value={value}
            onChange={handleChange}
            fullWidth
        >
            {options.map((option) => (
                <MenuItem key={option} value={option}>
                    {option}
                </MenuItem>
            ))}
        </Select>
    );
}

export default SelectEditor;
