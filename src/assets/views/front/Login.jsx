import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Login({ getProducts, setIsAuth }) {
    // const [formData, setFormData] = useState({
    //     username: "",
    //     password: "",
    // });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            username: "",
            password: "",
        }
    })

    const inputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((preData) => ({
            ...preData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // 登入
    const onSubmit = async (formData) => {
        try {
            // e.preventDefault();
            const response = await axios.post(`${API_BASE}/admin/signin`, formData);
            console.log(response.data);

            // 設定cookie
            const { token, expired } = response.data;
            document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
            axios.defaults.headers.common["Authorization"] = token;

            // getProducts();
            // setIsAuth(true);

        } catch (error) {
            setIsAuth(false);
            console.log(error);
        }
    };

    return (
        <div className="container login">
            <h1>請先登入</h1>
            <form className="form-floating" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-floating mb-3">
                    <input
                        type="email"
                        className="form-control"
                        name="username"
                        placeholder="name@example.com"
                        {...register('username', {
                            required: '請輸入 Email',
                            pattern: {
                                value: /^\S+@\S+$/i,
                                message: "Email 格式不正確",
                            },
                        })}
                    // value={formData.username}
                    // onChange={inputChange}
                    />
                    {
                        errors.username && (
                            <p className="text-danger">{errors.username.message}</p>
                        )
                    }
                    <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                    <input
                        type="password"
                        className="form-control"
                        name="password"
                        placeholder="Password"
                        {...register('password', {
                            required: '請輸入密碼',
                            minLength: {
                                value: 6,
                                message: "密碼長度至少需 6 碼",
                            },
                        })}
                    // value={formData.password}
                    // onChange={inputChange}
                    />
                    {
                        errors.password && (
                            <p className="text-danger">{errors.password.message}</p>
                        )
                    }
                    <label htmlFor="password">Password</label>
                </div>
                <button
                    type="submit"
                    className="btn btn-primary mt-2"
                    style={{ width: "100%" }}
                >
                    登入
                </button>
            </form>
        </div>
    )
}

export default Login