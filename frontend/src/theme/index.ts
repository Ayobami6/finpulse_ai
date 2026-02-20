import { extendTheme } from "@chakra-ui/react";

const colors = {
    brand: {
        50: "#e0f2f1",
        100: "#b2dfdb",
        200: "#80cbc4",
        300: "#4db6ac",
        400: "#26a69a",
        500: "#009688", // Teal as primary
        600: "#00897b",
        700: "#00796b",
        800: "#00695c",
        900: "#004d40",
    },
};

const theme = extendTheme({
    colors,
    fonts: {
        heading: `'Inter', sans-serif`,
        body: `'Inter', sans-serif`,
    },
    components: {
        Button: {
            baseStyle: {
                fontWeight: "bold",
            },
            variants: {
                solid: {
                    bg: "brand.500",
                    color: "white",
                    _hover: {
                        bg: "brand.600",
                    },
                },
            },
        },
        Card: {
            baseStyle: {
                container: {
                    borderRadius: "xl",
                    boxShadow: "sm",
                },
            },
        },
    },
});

export default theme;
