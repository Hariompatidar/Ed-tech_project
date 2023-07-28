import {createSlice } from "@reduxjs/toolkit";

const initialState={
    totalItems:localStorage.getItem("totalItems") ? JSON.parse(localStorage.getItem("totalItems")): null,
}

const cartSlice= createSlice({
    name:"totalItems",
    initialState: initialState,
    reducers:{
        setToken(state,value){
            state.totalItems= value.payload;
        },
        //add to cart
        // removefromcart
        // resetCart
    },
});

export const {setTotalItems}= cartSlice.actions;
export default cartSlice.reducer;