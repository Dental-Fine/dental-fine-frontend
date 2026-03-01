import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Login} from '../pages/Auth/Login';
import {Inicio} from '../pages/Dashboard/Inicio';

export const AppRouter = ()=>{
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/dashboard" element={<Inicio/>}/>
            </Routes>

        </BrowserRouter>
    );
};