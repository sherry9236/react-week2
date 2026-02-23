import { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as bootstrap from 'bootstrap';

import "./assets/style.css";
import ProductModal from "./components/ProductModal";
import Pagination from "./components/Pagination";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [],
};

function App() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // 登入狀態管理(控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);

  const inputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((preData) => ({
      ...preData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleModalInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setTemplateProduct((preData) => ({
      ...preData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleModalImageChange = (index, value) => {
    setTemplateProduct((pre) => {
      const newImage = [...pre.imagesUrl]
      newImage[index] = value
      return {
        ...pre,
        imagesUrl: newImage
      }
    });
  };

  const handleAddImage = () => {
    setTemplateProduct((pre) => {
      const newImage = [...pre.imagesUrl]
      newImage.push("");
      return {
        ...pre,
        imagesUrl: newImage,
      };
    });
  };

  const handleRemoveImage = () => {
    setTemplateProduct((pre) => {
      const newImage = [...pre.imagesUrl]
      newImage.pop();
      return {
        ...pre,
        imagesUrl: newImage
      };
    });
  };

  // 目前選中的產品
  const [products, setProducts] = useState([]);
  // 產品資料狀態
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState("");
  const [pagination, setPagination] = useState({});
  const productModalRef = useRef(null);

  const getProducts = async (page=1) => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products?page=${page}` , );
      // console.log(response);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.log(error);
    }
  };

  const updateProduct = async (id) => {
    let url = `${API_BASE}/api/${API_PATH}/admin/product`
    let method = 'post'

    if (modalType === 'edit') {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`
      method = 'put'
    }

    const productData = {
      data: {
        ...templateProduct,
        origin_price: Number(templateProduct.origin_price),
        price: Number(templateProduct.price),
        is_enabled: templateProduct.is_enabled ? 1 : 0,
        imagesUrl: [...templateProduct.imagesUrl.filter(url => url !== "")],
      },
    };

    try {
      const response = await axios[method](url, productData);
      getProducts();
      closeModal();
    } catch (error) {
      console.log(error.response);
    }
  };

  const delProduct = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`);
      getProducts();
      closeModal();
    } catch (error) {
      console.log(error.response);
    }
  }

  const uploadImage = async (e) => {
    const file = e.target.files?.[0]
    if(!file) {
      return
    }

    try {
      const formData = new FormData()
      formData.append('file-to-upload', file)

      const response = await axios.post(`${API_BASE}/api/${API_PATH}/admin/upload`, formData,);

      setTemplateProduct((pre) => ({
        ...pre,
        imageUrl: response.data.imageUrl,
      }));
    } catch (error) {
      console.log(error.response);
    }

  }

  // 登入
  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      // console.log(response.data);

      // 設定cookie
      const { token, expired } = response.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common["Authorization"] = token;

      getProducts();
      setIsAuth(true);

    } catch (error) {
      setIsAuth(false);
      console.log(error);
    }
  };

  useEffect(() => {
    // 讀取cookie
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
    }

    productModalRef.current = new bootstrap.Modal('#productModal', {
      keyboard: false
    })

    // 確認是否登入
    const checkLogin = async () => {
      try {
        const response = await axios.post(`${API_BASE}/api/user/check`);
        console.log(response.data);

        setIsAuth(true);
        getProducts();

      } catch (error) {
        console.log(error);
      }
    };

    checkLogin();
  }, []);

  const openModal = (type, product) => {
    setModalType(type)
    setTemplateProduct((pre) => ({
      ...pre,
      ...product,
    }));
    productModalRef.current.show();
  };

  const closeModal = () => {
    productModalRef.current.hide();
  };

  return (
    <>
      {!isAuth ? (
        <div className="container login">
          <h1>請先登入</h1>
          <form className="form-floating" onSubmit={onSubmit}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                name="username"
                placeholder="name@example.com"
                value={formData.username}
                onChange={inputChange}
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={inputChange}
              />
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
      ) : (
        <div className="container">
          <h2>產品列表</h2>
          <div className="text-end mt-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => openModal("create", INITIAL_TEMPLATE_DATA)}>
              建立新的產品
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>產品名稱</th>
                <th>分類</th>
                <th>原價</th>
                <th>售價</th>
                <th>是否啟用</th>
                <th>編輯</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.id}>
                  <td>{item.category}</td>
                  <th>{item.title}</th>
                  <td>{item.origin_price}</td>
                  <td>{item.price}</td>
                  <td className={`${item.is_enabled && "text-success"}`}>{item.is_enabled ? "啟用" : "未啟用"}</td>
                  <td>
                    <div className="btn-group" role="group" aria-label="Basic example">
                      <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal("edit", item)}>編輯</button>
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => openModal('delete', item)}>刪除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination pagination={pagination} onChangePage={getProducts}/>
        </div>
      )}

      <ProductModal
        modalType={modalType}
        templateProduct={templateProduct}
        handleModalInputChange={handleModalInputChange}
        handleModalImageChange={handleModalImageChange}
        handleAddImage={handleAddImage}
        handleRemoveImage={handleRemoveImage}
        updateProduct={updateProduct}
        delProduct={delProduct}
        uploadImage={uploadImage}
        closeModal={closeModal} />
    </>
  );
}

export default App;