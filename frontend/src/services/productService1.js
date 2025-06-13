// frontend/src/services/productService.js

// Datos mock iniciales
const mockProducts = [
  {
    productId: 101,
    name: "Laptop HP",
    categoryId: 5,
    stock: 20,
    price: 799990
  },
  {
    productId: 102,
    name: "Teclado inalámbrico",
    categoryId: 5,
    stock: 15,
    price: 29990
  },
  {
    productId: 103,
    name: "Mouse gaming",
    categoryId: 5,
    stock: 30,
    price: 24990
  }
];

// Simulación de operaciones CRUD
const productService = {
  getAll: async () => {
    // Simular retardo de red
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockProducts];
  },

  create: async (product) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newProduct = {
      ...product,
      productId: Math.max(...mockProducts.map(p => p.productId)) + 1
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  update: async (id, productData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockProducts.findIndex(p => p.productId === id);
    if (index !== -1) {
      mockProducts[index] = { ...mockProducts[index], ...productData };
      return mockProducts[index];
    }
    return null;
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockProducts.findIndex(p => p.productId === id);
    if (index !== -1) {
      mockProducts.splice(index, 1);
      return true;
    }
    return false;
  }
};

export default productService;