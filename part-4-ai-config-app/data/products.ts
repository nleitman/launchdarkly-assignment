import { productsAvailable } from "./mockProducts";

export type Product = {
    name: string;
    productId: string;
    description: string;
    price: number;
    type: "shoes" | "clothing" | "accessories" | "fitness";
    preferenceTags: string[];
}

export const getProducts = () => {
    return {
        productsAvailable,
    }
}

// format is [Product Name, Product ID, Product Type, {Preference tags}]
export const formatProductForCompletion = (product: Product) => {
    return `[${product.name}, ${product.productId}, ${product.type}, ${product.preferenceTags.join(", ")}]`
}
