import { createHashRouter } from "react-router";
import FrontendLayout from "./assets/layout/FrontendLayout";
import Home from "./assets/views/front/Home";
import Products from "./assets/views/front/Products";
import SingleProduct from "./assets/views/front/SingleProduct";
import Cart from "./assets/views/front/Cart";
import NotFound from "./assets/views/front/NotFound";
import Checkout from "./assets/views/front/Checkout";
import Login from "./assets/views/front/Login";

export const router = createHashRouter([
    {
        path: '/',
        element: <FrontendLayout />,
        children: [{
            index: true,
            element: <Home />
        },
        {
            path: 'product',
            element: <Products />
        },
        {
            path: 'product/:id',
            element: <SingleProduct />
        },
        {
            path: 'cart',
            element: <Cart />
        },
        {
            path: 'checkout',
            element: <Checkout />
        },
        {
            path: 'login',
            element: <Login />
        }
    ]
    },{
        path: '*',
        element: <NotFound />
    }
])